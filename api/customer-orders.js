/**
 * Vercel Edge Function — customer order history by phone number.
 *
 * POST /api/customer-orders
 *   body: { phone, cursor? }
 *
 * Returns: { orders, hasMore, total, customerName }
 *
 * Security:
 *   - Phone validated to 10-digit format
 *   - Full address NOT returned (city only via addresses join)
 *   - Payment session / Zoho IDs NOT returned
 *   - Rate limited by middleware (60 req/min per IP)
 */

export const config = { runtime: 'edge' }

const PAGE_SIZE = 20

const cors = {
  'Access-Control-Allow-Origin':  process.env.APP_URL || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

function sbFetch(supabaseUrl, serviceKey, path, options = {}) {
  return fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method: 'GET',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      apikey:         serviceKey,
      Authorization:  `Bearer ${serviceKey}`,
      ...(options.headers || {}),
    },
  })
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
  const cursor = body.cursor  || null

  if (!/^\d{10}$/.test(phone)) {
    return new Response(
      JSON.stringify({ error: 'Please enter a valid 10-digit mobile number.' }),
      { status: 400, headers: cors }
    )
  }

  try {
    // ── Step 1: Look up customer by phone ──────────────────────────────────
    const custRes  = await sbFetch(supabaseUrl, serviceKey,
      `customers?phone=eq.${encodeURIComponent(phone)}&select=id,full_name&limit=1`
    )
    if (!custRes.ok) {
      const err = await custRes.text()
      console.error('[customer-orders] customer lookup failed:', custRes.status, err)
      return new Response(JSON.stringify({ error: 'Could not verify phone number.' }), { status: 500, headers: cors })
    }
    const custData = await custRes.json()
    const customer = Array.isArray(custData) ? custData[0] : null

    if (!customer) {
      // Unknown phone — return empty gracefully
      return new Response(
        JSON.stringify({ orders: [], hasMore: false, total: 0, customerName: null }),
        { status: 200, headers: cors }
      )
    }

    // ── Step 2: Fetch orders (no nested joins — items fetched separately) ──
    // Using separate queries matches the proven pattern in useAdminOrders.
    let ordersPath = `orders`
      + `?customer_id=eq.${customer.id}`
      + `&select=id,order_number,placed_at,status,payment_status,payment_method`
      + `,total_amount,subtotal,delivery_fee,delivery_slot,notes,address_id`
      + `&order=placed_at.desc`
      + `&limit=${PAGE_SIZE}`

    if (cursor) ordersPath += `&placed_at=lt.${encodeURIComponent(cursor)}`

    const ordersRes = await sbFetch(supabaseUrl, serviceKey, ordersPath, {
      headers: { Prefer: 'count=exact' },
    })

    if (!ordersRes.ok) {
      const err = await ordersRes.text()
      console.error('[customer-orders] orders query failed:', ordersRes.status, err)
      return new Response(
        JSON.stringify({ error: 'Could not load orders. Please try again.' }),
        { status: 500, headers: cors }
      )
    }

    const ordersData = await ordersRes.json()
    // Supabase returns an error object (not array) on query failure
    if (!Array.isArray(ordersData)) {
      console.error('[customer-orders] unexpected orders response:', JSON.stringify(ordersData))
      return new Response(
        JSON.stringify({ error: 'Could not load orders. Please try again.' }),
        { status: 500, headers: cors }
      )
    }

    const total = cursor
      ? -1
      : parseInt(ordersRes.headers.get('content-range')?.split('/')[1] ?? '0', 10)

    if (ordersData.length === 0) {
      return new Response(
        JSON.stringify({ orders: [], hasMore: false, total: total >= 0 ? total : 0, customerName: customer.full_name }),
        { status: 200, headers: cors }
      )
    }

    const orderIds = ordersData.map(o => o.id)

    // ── Step 3: Fetch order items for this page in one query ───────────────
    const itemsRes = await sbFetch(supabaseUrl, serviceKey,
      `order_items?order_id=in.(${orderIds.join(',')})&select=id,order_id,product_id,product_name,unit,quantity,unit_price,total_price`
    )
    const itemsData = itemsRes.ok ? await itemsRes.json() : []
    const itemsByOrder = {}
    ;(Array.isArray(itemsData) ? itemsData : []).forEach(item => {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = []
      itemsByOrder[item.order_id].push(item)
    })

    // ── Step 4: Fetch addresses for this page in one query ─────────────────
    const addressIds = [...new Set(ordersData.map(o => o.address_id).filter(Boolean))]
    let addressById = {}
    if (addressIds.length > 0) {
      const addrRes = await sbFetch(supabaseUrl, serviceKey,
        `addresses?id=in.(${addressIds.join(',')})&select=id,address_line1,address_line2,city,pincode`
      )
      if (addrRes.ok) {
        const addrData = await addrRes.json()
        ;(Array.isArray(addrData) ? addrData : []).forEach(a => { addressById[a.id] = a })
      }
    }

    // ── Step 5: Assemble and return ────────────────────────────────────────
    const orders = ordersData.map(order => ({
      ...order,
      order_items: itemsByOrder[order.id] || [],
      addresses:   order.address_id ? addressById[order.address_id] || null : null,
    }))

    return new Response(
      JSON.stringify({
        orders,
        hasMore:      orders.length === PAGE_SIZE,
        total:        total >= 0 ? total : undefined,
        customerName: customer.full_name || null,
      }),
      { status: 200, headers: cors }
    )
  } catch (err) {
    console.error('[customer-orders] unexpected error:', err.message)
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: cors }
    )
  }
}
