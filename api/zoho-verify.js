/**
 * Vercel Edge Function — verify Zoho Payments redirect signature.
 *
 * After payment, Zoho redirects to success_url or failure_url with these params:
 *   payments_session_id, payment_session_status, payment_id, payment_status,
 *   amount, mandate_id, udf1–udf5, signature
 *
 * Signature is HMAC-SHA256 of:
 *   payments_session_id.payment_session_status.payment_id.payment_status
 *   .amount.mandate_id.udf1.udf2.udf3.udf4.udf5
 * (empty string for absent fields, all joined by dots)
 *
 * Signing key: ZOHO_CLIENT_SECRET (set in Vercel env vars)
 *
 * GET /api/zoho-verify?paymentsSessionId=&paymentSessionStatus=&paymentId=
 *                      &paymentStatus=&amount=&mandateId=&udf1=&signature=
 */

export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 })

  const p = new URL(req.url).searchParams

  const paymentsSessionId    = p.get('paymentsSessionId')    || ''
  const paymentSessionStatus = p.get('paymentSessionStatus') || ''
  const paymentId            = p.get('paymentId')            || ''
  const paymentStatus        = p.get('paymentStatus')        || ''
  const amount               = p.get('amount')               || ''
  const mandateId            = p.get('mandateId')            || ''
  const udf1                 = p.get('udf1')                 || ''
  const udf2                 = p.get('udf2')                 || ''
  const udf3                 = p.get('udf3')                 || ''
  const udf4                 = p.get('udf4')                 || ''
  const udf5                 = p.get('udf5')                 || ''
  const signature            = p.get('signature')            || ''

  const signingKey = process.env.ZOHO_CLIENT_SECRET
  if (!signingKey) {
    // Can't verify without signing key — return status from URL params (trust-only)
    return new Response(
      JSON.stringify({ verified: false, status: paymentSessionStatus, reason: 'no_signing_key' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Build the message string exactly as Zoho computes it
  const message = [
    paymentsSessionId, paymentSessionStatus, paymentId, paymentStatus,
    amount, mandateId, udf1, udf2, udf3, udf4, udf5,
  ].join('.')

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(signingKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const mac      = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  const computed = btoa(String.fromCharCode(...new Uint8Array(mac)))

  const verified = computed === signature

  return new Response(
    JSON.stringify({ verified, status: paymentSessionStatus }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
