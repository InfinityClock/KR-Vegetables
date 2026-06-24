/**
 * Public order tracking endpoint — no auth required.
 *
 * GET /api/track-order?orderId=<uuid>
 *   Look up an order by its UUID (used by the tracking page for guest customers).
 *   Also returns order_tracking entries so the timeline renders correctly.
 *   Order UUIDs are cryptographically random and unguessable, so public
 *   access by ID alone is safe — this is the standard "secret tracking link"
 *   pattern used by virtually every e-commerce site.
 *
 * GET /api/track-order?orderNumber=1042&phone=9876543210
 *   Look up an order by its human-readable order number. UNLIKE the UUID
 *   path, order numbers are sequential (1001, 1002, 1003...) and trivially
 *   enumerable. Looking one up WITHOUT a matching phone number previously
 *   returned full order contents (items, amount, delivery slot, notes) to
 *   anyone who could count — confirmed exploitable in a live security audit.
 *   `phone` is now REQUIRED for this path and is verified server-side
 *   against the order's actual customer before any data is returned. A
 *   mismatch returns the exact same 404 used for a nonexistent order, so
 *   the response can't be used to confirm whether an order number exists.
 *
 * Both routes deliberately omit sensitive customer data (phone, full address)
 * from the response payload itself.
 *
 * Returns:
 *   { id, order_number, status, payment_status, payment_method,
 *     delivery_slot, placed_at, total_amount,
 *     order_items: [{product_name, quantity, unit, unit_price}],
 *     order_tracking: [{status, message, updated_at}]   (orderId lookup only)
 *   }
 *   or 404 { error: 'Order not found' }
 */

export const config = { runtime: 'edge' }

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (req.method !== 'GET')    return new Response('Method not allowed', { status: 405, headers: cors })

  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL

  if (!serviceKey || !supabaseUrl) {
    return new Response(JSON.stringify({ error: 'Server misconfiguration' }), { status: 500, headers: cors })
  }

  const url         = new URL(req.url)
  const orderNumber = url.searchParams.get('orderNumber')?.trim().toUpperCase()
  const orderId     = url.searchParams.get('orderId')?.trim()
  const phone       = url.searchParams.get('phone')?.replace(/\D/g, '').slice(-10) || ''

  if (!orderNumber && !orderId) {
    return new Response(JSON.stringify({ error: 'orderNumber or orderId is required' }), { status: 400, headers: cors })
  }

  // Order-number lookups are enumerable (sequential), so a verified phone
  // is mandatory on this path. UUID lookups remain phone-free — the UUID
  // itself is the secret.
  if (orderNumber && !orderId && phone.length !== 10) {
    return new Response(JSON.stringify({ error: 'A valid phone number is required to track by order number' }), { status: 400, headers: cors })
  }

  const sbHeaders = {
    'Content-Type': 'application/json',
    apikey:         serviceKey,
    Authorization:  `Bearer ${serviceKey}`,
  }

  // Build the order filter
  const filter = orderId
    ? `id=eq.${encodeURIComponent(orderId)}`
    : `order_number=eq.${encodeURIComponent(orderNumber)}`

  // Include customers(phone) so the orderNumber path can verify ownership
  // server-side. Never included in the response sent back to the client.
  const [orderRes, trackingRes] = await Promise.all([
    fetch(
      `${supabaseUrl}/rest/v1/orders?${filter}&select=id,order_number,status,payment_status,payment_method,delivery_slot,placed_at,total_amount,notes,order_items(product_name,quantity,unit,unit_price,total_price),customers(phone)&limit=1`,
      { headers: sbHeaders }
    ),
    // Only fetch tracking when looking up by orderId (tracking page use-case)
    orderId
      ? fetch(
          `${supabaseUrl}/rest/v1/order_tracking?order_id=eq.${encodeURIComponent(orderId)}&select=status,message,updated_at&order=updated_at.asc`,
          { headers: sbHeaders }
        )
      : Promise.resolve(null),
  ])

  if (!orderRes.ok) {
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500, headers: cors })
  }

  const data = await orderRes.json()
  const order = Array.isArray(data) ? data[0] : null

  if (!order) {
    return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: cors })
  }

  // Verify phone ownership for the order-number path. Same 404 message as
  // "not found" — a wrong-phone guess must not reveal that the order number
  // itself is real.
  if (orderNumber && !orderId) {
    const ownerPhone = (order.customers?.phone || '').replace(/\D/g, '').slice(-10)
    if (!ownerPhone || ownerPhone !== phone) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: cors })
    }
  }

  // Never leak the customer object itself, regardless of which path matched.
  delete order.customers

  // Attach tracking entries when available
  if (trackingRes?.ok) {
    order.order_tracking = await trackingRes.json()
  }

  return new Response(JSON.stringify(order), { status: 200, headers: cors })
}
