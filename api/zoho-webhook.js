/**
 * Vercel Edge Function — handle Zoho Payments webhook events.
 * Receives real-time payment status updates and syncs them to Supabase.
 *
 * POST /api/zoho-webhook
 *
 * Required Vercel env vars:
 *   SUPABASE_SERVICE_ROLE_KEY
 *   VITE_SUPABASE_URL
 *   ZOHO_WEBHOOK_SECRET  — Webhooks → Signing Key (REQUIRED — requests without
 *                          a valid signature are rejected with 401)
 */

export const config = { runtime: 'edge' }

async function verifySignature(secret, payload, signature) {
  if (!signature) return false
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const mac      = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const computed = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  // Constant-time comparison to prevent timing attacks
  if (computed.length !== signature.length) return false
  let diff = 0
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return diff === 0
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 })
  if (req.method !== 'POST')   return new Response('Method not allowed', { status: 405 })

  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const secret      = process.env.ZOHO_WEBHOOK_SECRET

  // Signature verification is mandatory — reject all requests when secret is not configured.
  // Set ZOHO_WEBHOOK_SECRET in Vercel env vars from Zoho Payments → Settings → Webhooks → Signing Key.
  if (!secret) {
    console.error('[zoho-webhook] ZOHO_WEBHOOK_SECRET is not configured — rejecting request')
    return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), { status: 500 })
  }

  const rawBody  = await req.text()
  const signature = req.headers.get('X-Zoho-Signature') || ''
  const valid     = await verifySignature(secret, rawBody, signature)
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), { status: 401 })
  }

  let event
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { status: 400 })
  }

  const eventType   = event.event_type
  const eventObject = event.event_object ?? {}

  const statusMap = {
    'payment_link.paid':    'paid',
    'payment.succeeded':    'paid',
    'payment_link.expired': 'failed',
    'payment.failed':       'failed',
  }
  const newPaymentStatus = statusMap[eventType]

  if (!newPaymentStatus) {
    return new Response(JSON.stringify({ ok: true, skipped: eventType }), { status: 200 })
  }

  // Extract order number from the event object.
  // payment_link.paid  → reference_id field (set when creating the payment link)
  // payment.succeeded  → meta_data array (set in payment session creation request)
  //                      udf1 is browser-side only and does not appear in this payload
  const metaOrderNumber = Array.isArray(eventObject.meta_data)
    ? (eventObject.meta_data.find((m) => m.key === 'order_number')?.value ?? null)
    : null

  const referenceId = eventObject.reference_id
    || metaOrderNumber
    || eventObject.udf1               // kept as last resort for payment links
    || eventObject.custom_fields?.udf1

  const zohoPaymentId = eventObject.payment_link_id
    || eventObject.payment_id
    || event.event_id

  if (!referenceId) {
    console.warn('[zoho-webhook] No reference_id/udf1 in event:', eventType, JSON.stringify(eventObject))
    return new Response(JSON.stringify({ ok: true, skipped: 'no reference_id' }), { status: 200 })
  }

  const sbHeaders = {
    'Content-Type':  'application/json',
    apikey:          serviceKey,
    Authorization:   `Bearer ${serviceKey}`,
    Prefer:          'return=minimal',
  }

  // Update payment_status
  const updatePayload = { payment_status: newPaymentStatus }
  if (zohoPaymentId) updatePayload.zoho_payment_id = zohoPaymentId

  await fetch(
    `${supabaseUrl}/rest/v1/orders?order_number=eq.${encodeURIComponent(referenceId)}&payment_status=eq.pending`,
    { method: 'PATCH', headers: sbHeaders, body: JSON.stringify(updatePayload) }
  )

  // If paid, also confirm the order in a single update
  if (newPaymentStatus === 'paid') {
    await fetch(
      `${supabaseUrl}/rest/v1/orders?order_number=eq.${encodeURIComponent(referenceId)}&status=eq.placed`,
      { method: 'PATCH', headers: sbHeaders, body: JSON.stringify({ status: 'confirmed' }) }
    )
  }

  return new Response(JSON.stringify({ ok: true, event: eventType }), { status: 200 })
}
