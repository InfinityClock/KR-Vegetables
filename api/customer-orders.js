/**
 * Vercel Edge Function — customer order history by phone number.
 *
 * Since customers are guests (no Supabase auth accounts), phone is the
 * authoritative identity. This endpoint looks up the customer by phone
 * and returns their full paginated order history.
 *
 * POST /api/customer-orders
 *   body: { phone, cursor? }
 *
 *   phone  — 10-digit Indian mobile number (digits only)
 *   cursor — placed_at timestamp of the last item (for keyset pagination)
 *
 * Returns:
 *   { orders: [...], hasMore: bool, total: number }
 *
 * Security:
 *   - Phone validated to 10-digit format before any DB query
 *   - Full delivery address NOT returned (city only)
 *   - Payment session / Zoho IDs NOT returned
 *   - Rate limited by Vercel Edge Middleware (60 req/min per IP)
 */

export const config = { runtime: 'edge' }

const PAGE_SIZE = 20

const cors = {
  'Access-Control-Allow-Origin':  process.env.APP_URL || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (req.method !== 'POST')    return new Response('Method not allowed', { status: 405, headers: cors })

  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  if (!serviceKey || !supabaseUrl) {
    return new Response(JSON.stringify({ error: 'Server misconfiguration' }), { status: 500, headers: cors })
  }

  let body
  try { body = await req.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: cors })
  }

  const phone  = (body.phone  || '').replace(/\D/g, '').slice(-10)
  const cursor = body.cursor || null

  if (!/^\d{10}$/.test(phone)) {
    return new Response(
      JSON.stringify({ error: 'Please enter a valid 10-digit mobile number.' }),
      { status: 400, headers: cors }
    )
  }

  const sb = (path, opts = {}) =>
    fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        apikey:         serviceKey,
        Authorization:  `Bearer ${serviceKey}`,
        ...opts.headers,
      },
    })

  // 1. Look up customer by phone
  const custRes  = await sb(`customers?phone=eq.${encodeURIComponent(phone)}&select=id,full_name&limit=1`)
  const custData = await custRes.json()
  const customer = Array.isArray(custData) ? custData[0] : null

  if (!customer) {
    // No customer found — return empty (not 404) so the UI can show a friendly message
    return new Response(
      JSON.stringify({ orders: [], hasMore: false, total: 0, customerName: null }),
      { status: 200, headers: cors }
    )
  }

  // 2. Fetch orders for this customer (keyset pagination on placed_at DESC)
  // Select only the fields needed for display — no payment session IDs, no full address
  let ordersUrl = `${supabaseUrl}/rest/v1/orders`
    + `?customer_id=eq.${customer.id}`
    + `&select=id,order_number,placed_at,status,payment_status,payment_method,total_amount,subtotal,delivery_fee,delivery_slot,notes`
    + `,addresses(address_line1,address_line2,city,pincode)`
    + `,order_items(id,product_id,product_name,unit,quantity,unit_price,total_price)`
    + `&order=placed_at.desc`
    + `&limit=${PAGE_SIZE}`

  if (cursor) ordersUrl += `&placed_at=lt.${encodeURIComponent(cursor)}`

  // Also get total count (first page only)
  const countRes = !cursor
    ? await sb(`orders?customer_id=eq.${customer.id}&select=id`, {
        headers: { Prefer: 'count=exact', Range: '0-0' },
      })
    : null

  const [ordersRes] = await Promise.all([
    sb(ordersUrl),
    countRes,
  ])

  const orders = await ordersRes.json()
  const total  = countRes
    ? parseInt(countRes.headers.get('content-range')?.split('/')[1] ?? '0', 10)
    : -1

  if (!Array.isArray(orders)) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch orders' }),
      { status: 500, headers: cors }
    )
  }

  return new Response(
    JSON.stringify({
      orders,
      hasMore:      orders.length === PAGE_SIZE,
      total:        total >= 0 ? total : undefined,
      customerName: customer.full_name || null,
    }),
    { status: 200, headers: cors }
  )
}
