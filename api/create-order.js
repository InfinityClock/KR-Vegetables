/**
 * POST /api/create-order
 * Guest order creation — uses service role key to bypass RLS.
 * No auth required. Creates customer (upsert by phone), address, order, items.
 */
export const config = { runtime: 'edge' }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

function generateOrderNumber() {
  const now = new Date()
  const yy  = String(now.getFullYear()).slice(2)
  const mm  = String(now.getMonth() + 1).padStart(2, '0')
  const dd  = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `KRV-${yy}${mm}${dd}-${rand}`
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

  const { name, phone, address, items, subtotal, deliveryFee, total, deliverySlot, notes, paymentMethod } = body

  if (!name || !phone || !address || !items?.length) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: corsHeaders })
  }

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
    // 1. Upsert customer by phone
    const custRes = await sb('customers?on_conflict=phone', {
      method: 'POST',
      body: JSON.stringify({ full_name: name, phone, email: null }),
    })
    const custData = await custRes.json()
    if (!custRes.ok) throw new Error(custData?.message || 'Failed to create customer')
    const customerId = custData[0]?.id

    // 2. Create address
    const addrRes = await sb('addresses', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: customerId,
        label: address.label || 'Home',
        address_line1: address.line1,
        address_line2: address.line2 || null,
        city: address.city,
        pincode: address.pincode,
        lat: address.lat || null,
        lng: address.lng || null,
        is_default: false,
      }),
    })
    const addrData = await addrRes.json()
    // Non-fatal: address might fail if lat/lng columns don't exist yet
    const addressId = addrData[0]?.id || null

    // If address insert failed due to lat/lng columns not existing, retry without them
    let finalAddressId = addressId
    if (!finalAddressId) {
      const addrRes2 = await sb('addresses', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: customerId,
          label: address.label || 'Home',
          address_line1: address.line1,
          address_line2: address.line2 || null,
          city: address.city,
          pincode: address.pincode,
          is_default: false,
        }),
      })
      const addrData2 = await addrRes2.json()
      finalAddressId = addrData2[0]?.id
    }

    // 3. Create order
    const orderNumber = generateOrderNumber()
    const orderRes = await sb('orders', {
      method: 'POST',
      body: JSON.stringify({
        order_number: orderNumber,
        customer_id: customerId,
        address_id: finalAddressId,
        status: 'placed',
        payment_status: 'pending',
        payment_method: paymentMethod || 'zoho',
        subtotal,
        delivery_fee: deliveryFee,
        discount: 0,
        total_amount: total,
        delivery_slot: deliverySlot,
        notes: notes || null,
        placed_at: new Date().toISOString(),
      }),
    })
    const orderData = await orderRes.json()
    if (!orderRes.ok) throw new Error(orderData?.message || 'Failed to create order')
    const order = orderData[0]

    // 4. Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id || null,
      product_name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      unit_price: item.offer_price || item.price,
      total_price: (item.offer_price || item.price) * item.quantity,
    }))
    await sb('order_items', { method: 'POST', body: JSON.stringify(orderItems) })

    // 5. Initial tracking entry
    await sb('order_tracking', {
      method: 'POST',
      body: JSON.stringify({
        order_id: order.id,
        status: 'placed',
        message: 'Your order has been placed successfully! 🎉',
        updated_by: 'system',
      }),
    })

    return new Response(
      JSON.stringify({ success: true, orderId: order.id, orderNumber, order }),
      { status: 200, headers: corsHeaders }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Order creation failed' }),
      { status: 500, headers: corsHeaders }
    )
  }
}
