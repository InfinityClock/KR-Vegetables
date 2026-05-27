/**
 * Vercel Edge Function — confirm a Zoho payment from the client side.
 *
 * Called from OrderSuccess.jsx when Zoho redirects to success_url with
 * payment_session_status=succeeded. Updates the order from pending → paid/confirmed.
 *
 * This is the primary confirmation path. The zoho-webhook is a secondary path.
 *
 * POST /api/confirm-payment
 *   body: { orderId, paymentsSessionId?, paymentSessionStatus? }
 *
 * Security: orderId is a UUID (unguessable). We only update orders that are
 * still in payment_status=pending to prevent double-processing.
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

  if (!serviceKey || !supabaseUrl) {
    return new Response(JSON.stringify({ error: 'Server misconfiguration' }), { status: 500, headers: cors })
  }

  let body
  try { body = await req.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: cors })
  }

  const { orderId, paymentsSessionId, paymentSessionStatus } = body

  if (!orderId) {
    return new Response(JSON.stringify({ error: 'orderId is required' }), { status: 400, headers: cors })
  }

  // If Zoho tells us the payment status and it's not 'succeeded', skip
  if (paymentSessionStatus && paymentSessionStatus !== 'succeeded') {
    return new Response(
      JSON.stringify({ ok: false, reason: `payment status is ${paymentSessionStatus}` }),
      { status: 200, headers: cors }
    )
  }

  const sbHeaders = {
    'Content-Type': 'application/json',
    apikey:          serviceKey,
    Authorization:   `Bearer ${serviceKey}`,
    Prefer:          'return=minimal',
  }

  // Only update orders that are still pending (idempotent — safe to call twice)
  const patchBody = {
    payment_status: 'paid',
    status:         'confirmed',
  }
  if (paymentsSessionId) patchBody.payments_session_id = paymentsSessionId

  const res = await fetch(
    `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&payment_status=eq.pending`,
    {
      method:  'PATCH',
      headers: sbHeaders,
      body:    JSON.stringify(patchBody),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    return new Response(JSON.stringify({ error: 'Failed to update order', detail: err }), { status: 500, headers: cors })
  }

  // Also add a tracking entry
  await fetch(`${supabaseUrl}/rest/v1/order_tracking`, {
    method:  'POST',
    headers: { ...sbHeaders, Prefer: 'return=minimal' },
    body: JSON.stringify({
      order_id:   orderId,
      status:     'confirmed',
      message:    'Payment received. Your order is confirmed! 🎉',
      updated_by: 'system',
    }),
  }).catch(() => { /* non-critical */ })

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors })
}
