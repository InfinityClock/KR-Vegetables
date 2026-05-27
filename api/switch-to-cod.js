/**
 * Vercel Edge Function — switch a failed online payment order to Cash on Delivery.
 * Called from the payment failure page when the customer chooses "Pay on Delivery instead."
 *
 * POST /api/switch-to-cod
 *   body: { orderId }
 *
 * No admin auth required — switching to COD is a safe operation
 * (the order is already created; we're just changing the payment method).
 */

export const config = { runtime: 'edge' }

export default async function handler(req) {
  const cors = {
    'Access-Control-Allow-Origin':  process.env.APP_URL || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (req.method !== 'POST')    return new Response('Method not allowed', { status: 405, headers: cors })

  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL

  let body
  try { body = await req.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: cors })
  }

  const { orderId } = body
  if (!orderId) {
    return new Response(JSON.stringify({ error: 'orderId is required' }), { status: 400, headers: cors })
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type':  'application/json',
        apikey:          serviceKey,
        Authorization:   `Bearer ${serviceKey}`,
        Prefer:          'return=minimal',
      },
      body: JSON.stringify({
        payment_method: 'cod',
        payment_status: 'pending',
        status:         'confirmed',
      }),
    }
  )

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to update order' }), { status: 500, headers: cors })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors })
}
