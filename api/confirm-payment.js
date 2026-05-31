/**
 * Vercel Edge Function — confirm a Zoho payment from the client side.
 *
 * Called from OrderSuccess.jsx when Zoho redirects to success_url with
 * payment_session_status=succeeded.
 *
 * Security: requires a HMAC-SHA256 confirm token (ct) that was embedded in the
 * success_url by zoho-payment.js and signed with PAYMENT_CONFIRM_SECRET.
 * This ensures only a genuine Zoho redirect can trigger order confirmation —
 * an attacker who knows the orderId but not the secret cannot forge the token.
 *
 * POST /api/confirm-payment
 *   body: { orderId, paymentsSessionId?, confirmToken }
 */

export const config = { runtime: 'edge' }

async function verifyConfirmToken(orderId, token, secret) {
  if (!token || !secret) return false
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(orderId))
  const computed = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  // Constant-time comparison to prevent timing attacks
  if (computed.length !== token.length) return false
  let diff = 0
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ token.charCodeAt(i)
  }
  return diff === 0
}

export default async function handler(req) {
  const cors = {
    'Access-Control-Allow-Origin':  process.env.APP_URL || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (req.method !== 'POST')    return new Response('Method not allowed', { status: 405, headers: cors })

  const serviceKey    = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl   = process.env.VITE_SUPABASE_URL
  const confirmSecret = process.env.PAYMENT_CONFIRM_SECRET

  if (!serviceKey || !supabaseUrl) {
    return new Response(JSON.stringify({ error: 'Server misconfiguration' }), { status: 500, headers: cors })
  }
  if (!confirmSecret) {
    return new Response(JSON.stringify({ error: 'PAYMENT_CONFIRM_SECRET is not configured' }), { status: 500, headers: cors })
  }

  let body
  try { body = await req.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: cors })
  }

  const { orderId, paymentsSessionId, confirmToken } = body

  if (!orderId) {
    return new Response(JSON.stringify({ error: 'orderId is required' }), { status: 400, headers: cors })
  }

  // Verify the HMAC confirm token — proves this request came from a genuine Zoho redirect.
  const tokenValid = await verifyConfirmToken(orderId, confirmToken, confirmSecret)
  if (!tokenValid) {
    return new Response(
      JSON.stringify({ error: 'Invalid or missing confirm token' }),
      { status: 401, headers: cors }
    )
  }

  const sbHeaders = {
    'Content-Type': 'application/json',
    apikey:          serviceKey,
    Authorization:   `Bearer ${serviceKey}`,
    Prefer:          'return=minimal',
  }

  // Only update orders that are still pending (idempotent — safe to call twice)
  const patchBody = { payment_status: 'paid', status: 'confirmed' }
  if (paymentsSessionId) patchBody.payments_session_id = paymentsSessionId

  const res = await fetch(
    `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&payment_status=eq.pending`,
    { method: 'PATCH', headers: sbHeaders, body: JSON.stringify(patchBody) }
  )

  if (!res.ok) {
    const err = await res.text()
    return new Response(JSON.stringify({ error: 'Failed to update order', detail: err }), { status: 500, headers: cors })
  }

  // Add a tracking entry (non-critical)
  await fetch(`${supabaseUrl}/rest/v1/order_tracking`, {
    method:  'POST',
    headers: { ...sbHeaders, Prefer: 'return=minimal' },
    body: JSON.stringify({
      order_id:   orderId,
      status:     'confirmed',
      message:    'Payment received. Your order is confirmed! 🎉',
      updated_by: 'system',
    }),
  }).catch(() => {})

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors })
}
