/**
 * POST /api/create-order
 * Guest order creation — uses service role key to bypass RLS.
 * No auth required. Creates customer (upsert by phone), address, order, items.
 */
export const config = { runtime: 'edge' }

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.APP_URL || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

// Returns the next sequential order number (1001, 1002, …)
// Uses the current total order count so numbers are gapless and human-readable.
async function getNextOrderNumber(supabaseUrl, serviceKey) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/orders?select=id`, {
      headers: {
        apikey:          serviceKey,
        Authorization:   `Bearer ${serviceKey}`,
        Prefer:          'count=exact',
        'Range-Unit':    'items',
        Range:           '0-0',
      },
    })
    // Content-Range: "0-0/42"  → total = 42
    const range = res.headers.get('content-range') || ''
    const total = parseInt(range.split('/')[1] || '0')
    return String(1001 + (isNaN(total) ? 0 : total))
  } catch {
    // Fallback: last 5 digits of current timestamp (still readable, very unlikely collision)
    return String(Date.now()).slice(-5)
  }
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL

  if (!serviceKey || !supabaseUrl) {
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration: missing Supabase env vars' }),
      { status: 500, headers: corsHeaders }
    )
  }

  let body
  try { body = await req.json() }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: corsHeaders }) }

  const { name, phone, address, items, deliverySlot, notes, paymentMethod, idempotencyKey } = body

  if (!name || !phone || !address || !items?.length) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: corsHeaders })
  }

  // Server-side length limits — defence in depth beyond the UI maxLength attributes
  if (name.length > 100)             return new Response(JSON.stringify({ error: 'Name is too long (max 100 characters)' }),          { status: 400, headers: corsHeaders })
  if ((notes || '').length > 500)    return new Response(JSON.stringify({ error: 'Notes are too long (max 500 characters)' }),         { status: 400, headers: corsHeaders })
  if ((address.line1 || '').length > 200) return new Response(JSON.stringify({ error: 'Address line 1 is too long (max 200 characters)' }), { status: 400, headers: corsHeaders })
  if ((address.city || '').length > 100)  return new Response(JSON.stringify({ error: 'City name is too long (max 100 characters)' }),       { status: 400, headers: corsHeaders })

  const sb = (path, opts = {}) =>
    fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: 'return=representation',
        ...opts.headers,
      },
    })

  try {
    // ── Idempotency check ────────────────────────────────────────────────────
    // If the client sends an idempotencyKey and an order with that key already
    // exists, return the existing order without creating a duplicate.
    if (idempotencyKey) {
      const existingRes  = await sb(`orders?idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&select=*&limit=1`)
      const existingData = await existingRes.json()
      if (Array.isArray(existingData) && existingData[0]?.id) {
        return new Response(
          JSON.stringify({ success: true, orderId: existingData[0].id, orderNumber: existingData[0].order_number, order: existingData[0] }),
          { status: 200, headers: corsHeaders }
        )
      }
    }

    const productIds = items.map((i) => i.id).filter(Boolean)
    if (!productIds.length) throw new Error('No valid product IDs in order')

    // ── Phase 1: Parallel pre-checks ────────────────────────────────────────
    // These four calls are entirely independent and run simultaneously:
    //   • store_open setting
    //   • handling_charge_rate setting
    //   • customer lookup by phone
    //   • product price + stock validation
    //   • next order number
    const [
      storeOpenRes,
      handlingRateRes,
      customerRes,
      priceRes,
      orderNumber,
    ] = await Promise.all([
      sb('store_settings?key=eq.store_open&select=value'),
      sb('store_settings?key=eq.handling_charge_rate&select=value'),
      sb(`customers?phone=eq.${encodeURIComponent(phone)}&select=id&limit=1`),
      sb(`products?id=in.(${productIds.join(',')})&select=id,name,price,offer_price,is_active,stock_status`),
      getNextOrderNumber(supabaseUrl, serviceKey),
    ])

    // Evaluate store_open
    const storeOpenData = await storeOpenRes.json()
    if (storeOpenData?.[0]?.value === 'false') {
      return new Response(
        JSON.stringify({ error: 'Store is currently closed. Please try again later.' }),
        { status: 403, headers: corsHeaders }
      )
    }

    // Evaluate handling rate
    const handlingRateData = await handlingRateRes.json()
    const handlingRate = parseFloat(handlingRateData?.[0]?.value || '0.02')

    // Evaluate product prices & stock
    const priceData = await priceRes.json()
    if (!Array.isArray(priceData)) throw new Error('Failed to fetch product prices')

    const productMap = {}
    for (const p of priceData) {
      if (!p.is_active)                   throw new Error(`"${p.name}" is no longer available`)
      if (p.stock_status === 'out_of_stock') throw new Error(`"${p.name}" is out of stock`)
      productMap[p.id] = p.offer_price !== null ? p.offer_price : p.price
    }

    // Compute authoritative subtotal from DB prices
    let serverSubtotal = 0
    const validatedItems = items.map((item) => {
      const unitPrice = productMap[item.id]
      if (unitPrice === undefined) throw new Error(`Product ${item.id} not found in catalogue`)
      const lineTotal = unitPrice * item.quantity
      serverSubtotal += lineTotal
      return { ...item, unitPrice, lineTotal }
    })
    const serverHandlingFee = Math.ceil(serverSubtotal * handlingRate)
    const serverTotal       = serverSubtotal + serverHandlingFee

    // ── Phase 2: Find or create customer ────────────────────────────────────
    const customerData = await customerRes.json()
    let customerId
    if (customerData?.[0]?.id) {
      customerId = customerData[0].id
    } else {
      const custRes  = await sb('customers', {
        method: 'POST',
        body:   JSON.stringify({ id: crypto.randomUUID(), full_name: name, phone, email: null }),
      })
      const custData = await custRes.json()
      if (!custRes.ok) throw new Error(custData?.message || custData?.details || 'Failed to create customer')
      customerId = custData[0]?.id
    }

    // ── Phase 3: Create address (needs customerId from Phase 2) ─────────────
    // lat/lng columns added in migration 009
    const addrRes  = await sb('addresses', {
      method: 'POST',
      body:   JSON.stringify({
        customer_id:   customerId,
        label:         address.label || 'Home',
        address_line1: address.line1,
        address_line2: address.line2 || null,
        city:          address.city,
        pincode:       address.pincode,
        lat:           address.lat  || null,
        lng:           address.lng  || null,
        is_default:    false,
      }),
    })
    const addrData = await addrRes.json()
    if (!addrRes.ok) throw new Error(addrData?.message || addrData?.details || 'Failed to save address')
    const finalAddressId = addrData[0]?.id || null

    // ── Phase 4: Create order ────────────────────────────────────────────────
    // Normalise payment method — only values in the DB enum are accepted.
    const safePaymentMethod = ['cod', 'zoho', 'razorpay'].includes(paymentMethod)
      ? paymentMethod
      : 'cod'
    const orderRes = await sb('orders', {
      method: 'POST',
      body: JSON.stringify({
        order_number: orderNumber,
        customer_id: customerId,
        address_id: finalAddressId,
        status: 'placed',
        payment_status: 'pending',
        payment_method: safePaymentMethod,
        subtotal:      serverSubtotal,
        delivery_fee:  serverHandlingFee,
        discount: 0,
        total_amount:  serverTotal,
        delivery_slot:    deliverySlot,
        notes:            notes || null,
        placed_at:        new Date().toISOString(),
        idempotency_key:  idempotencyKey || null,
      }),
    })
    const orderData = await orderRes.json()
    if (!orderRes.ok) throw new Error(orderData?.message || orderData?.details || JSON.stringify(orderData))
    const order = orderData[0]

    // 5. Create order items (using server-validated prices)
    const orderItems = validatedItems.map((item) => ({
      order_id: order.id,
      product_id: item.id || null,
      product_name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.lineTotal,
    }))
    await sb('order_items', { method: 'POST', body: JSON.stringify(orderItems) })

    // 6. Initial tracking entry
    await sb('order_tracking', {
      method: 'POST',
      body: JSON.stringify({
        order_id: order.id,
        status: 'placed',
        message: 'Your order has been placed successfully! 🎉',
        updated_by: 'system',
      }),
    })

    // Return the order WITH its items so the success page can display them
    // without needing an authenticated admin API call.
    // We already have validatedItems in memory — no extra DB round-trip needed.
    const orderWithItems = {
      ...order,
      order_items: validatedItems.map((item) => ({
        product_name: item.name,
        unit:         item.unit,
        quantity:     item.quantity,
        unit_price:   item.unitPrice,
        total_price:  item.lineTotal,
      })),
    }

    return new Response(
      JSON.stringify({ success: true, orderId: order.id, orderNumber, order: orderWithItems }),
      { status: 200, headers: corsHeaders }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Order creation failed' }),
      { status: 500, headers: corsHeaders }
    )
  }
}
