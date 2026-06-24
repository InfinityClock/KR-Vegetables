/**
 * Vercel Serverless Function — Admin Order Management
 * Runs on the server using the service role key → bypasses all RLS.
 * The service role key is NEVER sent to the browser.
 *
 * POST /api/admin-orders
 *   body: { action: 'update_status', orderId, newStatus, trackingMessage }
 *
 * GET  /api/admin-orders?status=all
 *   Returns all orders with items and customer info (no RLS restriction)
 */

export const config = { runtime: 'edge' }

function corsHeaders(req) {
  const origin = req?.headers?.get('origin') || ''
  const allowed = process.env.APP_URL || ''
  const isOk = !allowed
    || origin === allowed
    || /^https?:\/\/localhost(:\d+)?$/.test(origin)
  return {
    'Access-Control-Allow-Origin': isOk ? (origin || allowed || '*') : allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }
}

/**
 * Verifies the request is from an admin/sales user.
 * Returns { email, role } on success, or null on failure.
 * Only app_metadata is checked — it is server-only and cannot be written by the user.
 */
async function verifyAdmin(req, supabaseUrl, serviceKey) {
  const auth = req.headers.get('Authorization') || ''
  if (!auth.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: serviceKey },
  })
  if (!res.ok) return null
  const { app_metadata, email } = await res.json()
  // user_metadata is user-writable and must not be used for authorization.
  const role = app_metadata?.role || null
  const isAdmin = role === 'admin' || role === 'sales' || email === process.env.ADMIN_EMAIL
  return isAdmin ? { email, role } : null
}

export default async function handler(req) {
  const cors = corsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL

  if (!serviceKey) {
    return new Response(
      JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY is not set in Vercel environment variables.' }),
      { status: 500, headers: cors }
    )
  }

  const sbHeaders = {
    'Content-Type': 'application/json',
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Prefer': 'return=representation',
  }

  // ── GET: fetch orders ────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const orderId = url.searchParams.get('orderId')
    const status  = url.searchParams.get('status') || 'all'

    // Single-order lookup — requires admin auth
    if (orderId || url.searchParams.get('orderNumber')) {
      if (!await verifyAdmin(req, supabaseUrl, serviceKey)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors })
      }
      // (verifyAdmin returns {email,role} truthy object — cast to bool is fine here)
      const orderNumber = url.searchParams.get('orderNumber')
      const filter = orderId ? `id=eq.${orderId}` : `order_number=eq.${orderNumber}`
      const res = await fetch(
        `${supabaseUrl}/rest/v1/orders?${filter}&select=*,order_items(*)`,
        { headers: sbHeaders }
      )
      const data = await res.json()
      const order = Array.isArray(data) ? data[0] : null
      return new Response(JSON.stringify(order ?? null), { status: order ? 200 : 404, headers: cors })
    }

    // Admin order list — requires admin JWT
    if (!await verifyAdmin(req, supabaseUrl, serviceKey)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors })
    }

    let ordersUrl = `${supabaseUrl}/rest/v1/orders?select=*,customers(full_name,phone),order_items(*),addresses(*)&order=placed_at.desc`
    if (status !== 'all') {
      ordersUrl += `&status=eq.${status}`
    }

    const res = await fetch(ordersUrl, { headers: sbHeaders })
    const data = await res.json()
    return new Response(JSON.stringify(data), { status: res.status, headers: cors })
  }

  // ── POST: actions (admin only) ───────────────────────────────────────────
  if (req.method === 'POST') {
    const adminUser = await verifyAdmin(req, supabaseUrl, serviceKey)
    if (!adminUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors })
    }

    let body
    try { body = await req.json() } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: cors })
    }

    const { action, orderId, newStatus, trackingMessage } = body

    // ── update_status ──────────────────────────────────────────────────────
    if (action === 'update_status') {
      if (!orderId || !newStatus) {
        return new Response(
          JSON.stringify({ error: 'orderId and newStatus are required' }),
          { status: 400, headers: cors }
        )
      }

      // 1. Update the order
      const updateRes = await fetch(
        `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`,
        { method: 'PATCH', headers: sbHeaders, body: JSON.stringify({ status: newStatus }) }
      )
      const updated = await updateRes.json()

      if (!updateRes.ok) {
        return new Response(
          JSON.stringify({ error: 'Order update failed', details: updated }),
          { status: 400, headers: cors }
        )
      }

      // 2. Insert tracking entry
      if (trackingMessage) {
        await fetch(`${supabaseUrl}/rest/v1/order_tracking`, {
          method: 'POST',
          headers: sbHeaders,
          body: JSON.stringify({
            order_id: orderId,
            status: newStatus,
            message: trackingMessage,
            updated_by: 'admin',
          }),
        })
      }

      // 3. Push notification to the customer (fire-and-forget)
      // We use two strategies in parallel for maximum reach:
      //   a) by customer_phone — reaches ANY subscription linked to their phone
      //   b) by order_id — reaches the subscription made on this specific order
      // This handles customers who subscribed on a previous order (phone match)
      // and customers who subscribed on this exact order (order_id match).
      const pushMessages = {
        confirmed:        { title: '✅ Order Confirmed!',       body: `Your order is confirmed. We're getting it ready!` },
        packing:          { title: '📦 Packing Now',            body: 'Your fresh produce is being carefully packed.' },
        out_for_delivery: { title: '🚚 Out for Delivery',      body: 'Your order is on the way. Get ready!' },
        delivered:        { title: '✅ Delivered!',             body: 'Your order has been delivered. Enjoy!' },
        cancelled:        { title: '❌ Order Cancelled',        body: 'Your order was cancelled. WhatsApp us if you need help.' },
      }
      const push = pushMessages[newStatus]
      if (push) {
        const baseUrl = new URL(req.url).origin

        // Fetch the order to get the customer's phone for broader delivery
        const orderRes = await fetch(
          `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&select=customer_id,customers(phone)`,
          { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
        ).catch(() => null)
        const orderData = orderRes?.ok ? await orderRes.json() : []
        const customerPhone = orderData?.[0]?.customers?.phone || null

        const pushBody = {
          title:   push.title,
          body:    push.body,
          url:     `/track/${orderId}`,
          tag:     `order-${orderId}-${newStatus}`,
          orderId,
        }
        if (customerPhone) pushBody.customerPhone = customerPhone

        // Single call — push-send.js matches phone OR order_id in one
        // deduplicated query, so each device gets exactly one notification
        // regardless of which field(s) its subscription row has set.
        fetch(`${baseUrl}/api/push-send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-internal-token': serviceKey },
          body: JSON.stringify(pushBody),
        }).catch(() => {})
      }

      return new Response(
        JSON.stringify({ success: true, order: updated[0] ?? null }),
        { status: 200, headers: cors }
      )
    }

    // ── collect_payment ────────────────────────────────────────────────────
    // Marks a COD order as paid, records who collected and when.
    // Only works on COD orders with payment_status = 'pending'.
    if (action === 'collect_payment') {
      if (!orderId) {
        return new Response(JSON.stringify({ error: 'orderId is required' }), { status: 400, headers: cors })
      }

      // 1. Fetch the order to validate it's a COD + pending order
      const orderRes = await fetch(
        `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&select=id,order_number,payment_method,payment_status,total_amount,customers(phone)`,
        { headers: sbHeaders }
      )
      const orderData = await orderRes.json()
      const order = Array.isArray(orderData) ? orderData[0] : null

      if (!order) {
        return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: cors })
      }
      if (order.payment_method !== 'cod') {
        return new Response(JSON.stringify({ error: 'This order is not a COD order' }), { status: 400, headers: cors })
      }
      if (order.payment_status === 'paid') {
        return new Response(JSON.stringify({ error: 'Cash has already been marked as collected for this order' }), { status: 409, headers: cors })
      }

      const collectedAt = new Date().toISOString()
      const collectedBy = adminUser.email || 'admin'

      // 2. Update payment_status + audit columns atomically
      const updateRes = await fetch(
        `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`,
        {
          method: 'PATCH',
          headers: sbHeaders,
          body: JSON.stringify({
            payment_status: 'paid',
            collected_at:   collectedAt,
            collected_by:   collectedBy,
          }),
        }
      )
      const updated = await updateRes.json()
      if (!updateRes.ok) {
        return new Response(JSON.stringify({ error: 'Failed to update order', details: updated }), { status: 400, headers: cors })
      }

      // 3. Add order_tracking audit entry
      await fetch(`${supabaseUrl}/rest/v1/order_tracking`, {
        method: 'POST',
        headers: sbHeaders,
        body: JSON.stringify({
          order_id:   orderId,
          status:     'payment_collected',
          message:    `Cash collected by ${collectedBy}`,
          updated_by: collectedBy,
        }),
      })

      // 4. Push notification to customer (fire-and-forget)
      // Include both customerPhone and orderId for maximum reach — push-send.js
      // matches either in one deduplicated query (see update_status above).
      const customerPhone = order.customers?.phone || null
      const baseUrl = new URL(req.url).origin
      fetch(`${baseUrl}/api/push-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-token': serviceKey },
        body: JSON.stringify({
          title:         '💵 Payment Received',
          body:          `Your cash payment of ₹${Number(order.total_amount).toFixed(2)} has been collected. Thank you!`,
          url:           `/track/${orderId}`,
          tag:           `order-${orderId}-paid`,
          orderId,
          ...(customerPhone ? { customerPhone } : {}),
        }),
      }).catch(() => {})

      return new Response(
        JSON.stringify({
          success:      true,
          orderId,
          collectedAt,
          collectedBy,
          totalAmount:  order.total_amount,
        }),
        { status: 200, headers: cors }
      )
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: cors })
  }

  return new Response('Method not allowed', { status: 405, headers: cors })
}
