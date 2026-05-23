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
  const isOk = !allowed || origin === allowed || /^https?:\/\/localhost(:\d+)?$/.test(origin) || origin.endsWith('.vercel.app')
  return {
    'Access-Control-Allow-Origin': isOk ? (origin || allowed || '*') : allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }
}

async function verifyAdmin(req, supabaseUrl, serviceKey) {
  const auth = req.headers.get('Authorization') || ''
  if (!auth.startsWith('Bearer ')) return false
  const token = auth.slice(7)
  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: serviceKey },
  })
  if (!res.ok) return false
  const { user_metadata, app_metadata, email } = await res.json()
  return (
    user_metadata?.role === 'admin' ||
    user_metadata?.role === 'sales' ||
    app_metadata?.role === 'admin' ||
    app_metadata?.role === 'sales' ||
    email === process.env.ADMIN_EMAIL
  )
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL

  if (!serviceKey) {
    return new Response(
      JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY is not set in Vercel environment variables.' }),
      { status: 500, headers: corsHeaders }
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
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
      }
      const orderNumber = url.searchParams.get('orderNumber')
      const filter = orderId ? `id=eq.${orderId}` : `order_number=eq.${orderNumber}`
      const res = await fetch(
        `${supabaseUrl}/rest/v1/orders?${filter}&select=*,order_items(*)`,
        { headers: sbHeaders }
      )
      const data = await res.json()
      const order = Array.isArray(data) ? data[0] : null
      return new Response(JSON.stringify(order ?? null), { status: order ? 200 : 404, headers: corsHeaders })
    }

    // Admin order list — requires admin JWT
    if (!await verifyAdmin(req, supabaseUrl, serviceKey)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    let ordersUrl = `${supabaseUrl}/rest/v1/orders?select=*,customers(full_name,phone),order_items(*),addresses(*)&order=placed_at.desc`
    if (status !== 'all') {
      ordersUrl += `&status=eq.${status}`
    }

    const res = await fetch(ordersUrl, { headers: sbHeaders })
    const data = await res.json()
    return new Response(JSON.stringify(data), { status: res.status, headers: corsHeaders })
  }

  // ── POST: actions (admin only) ───────────────────────────────────────────
  if (req.method === 'POST') {
    if (!await verifyAdmin(req, supabaseUrl, serviceKey)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    let body
    try { body = await req.json() } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsHeaders })
    }

    const { action, orderId, newStatus, trackingMessage } = body

    // ── update_status ──────────────────────────────────────────────────────
    if (action === 'update_status') {
      if (!orderId || !newStatus) {
        return new Response(
          JSON.stringify({ error: 'orderId and newStatus are required' }),
          { status: 400, headers: corsHeaders }
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
          { status: 400, headers: corsHeaders }
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

      return new Response(
        JSON.stringify({ success: true, order: updated[0] ?? null }),
        { status: 200, headers: corsHeaders }
      )
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: corsHeaders })
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders })
}
