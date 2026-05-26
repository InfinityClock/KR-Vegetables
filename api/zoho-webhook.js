/**
 * Vercel Edge Function — handle Zoho Payments webhook events.
 * Receives real-time payment status updates and syncs them to Supabase.
 *
 * POST /api/zoho-webhook
 *
 * Register in Zoho Payments → Settings → Webhooks:
 *   URL:    https://<your-domain>/api/zoho-webhook
 *   Events: payment_link.paid, payment_link.expired, payment.succeeded, payment.failed
 *
 * Required Vercel env vars:
 *   SUPABASE_SERVICE_ROLE_KEY
 *   VITE_SUPABASE_URL
 *   ZOHO_WEBHOOK_SECRET  — Webhooks → Signing Key (optional but strongly recommended)
 *
 * Webhook payload shape (from Zoho Payments docs):
 * {
 *   event_id:     string,
 *   event_type:   "payment_link.paid" | "payment.succeeded" | ...,
 *   account_id:   string,
 *   live_mode:    boolean,
 *   event_time:   number,   // Unix timestamp
 *   event_object: { ... }   // resource-specific data
 * }
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
  const mac     = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const computed = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return computed === signature
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 })
  if (req.method !== 'POST')   return new Response('Method not allowed', { status: 405 })

  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const secret      = process.env.ZOHO_WEBHOOK_SECRET

  const rawBody = await req.text()

  // ── Signature verification (if secret is configured) ──────────────────────
  if (secret) {
    const signature = req.headers.get('X-Zoho-Signature') || ''
    const valid = await verifySignature(secret, rawBody, signature)
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), { status: 401 })
    }
  }

  let event
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { status: 400 })
  }

  const eventType   = event.event_type   // "payment_link.paid", "payment.succeeded", etc.
  const eventObject = event.event_object ?? {}

  // ── Map event type to our internal payment_status ─────────────────────────
  // Zoho event types (correct names from docs):
  //   payment_link.paid       — customer paid via a payment link ✅
  //   payment.succeeded       — direct payment succeeded ✅
  //   payment_link.expired    — link expired without payment
  //   payment.failed          — payment failed ❌
  const statusMap = {
    'payment_link.paid':    'paid',
    'payment.succeeded':    'paid',
    'payment_link.expired': 'failed',
    'payment.failed':       'failed',
  }
  const newPaymentStatus = statusMap[eventType]

  if (!newPaymentStatus) {
    // Event we don't care about (refunds, payouts, etc.) — acknowledge and ignore
    return new Response(JSON.stringify({ ok: true, skipped: eventType }), { status: 200 })
  }

  // ── Extract identifiers ────────────────────────────────────────────────────
  // reference_id is what we set to orderNumber when creating the payment link
  const referenceId     = eventObject.reference_id
  // For payment_link events the Zoho payment link ID
  const zohoPaymentId   = eventObject.payment_link_id
    || eventObject.payment_id
    || event.event_id

  if (!referenceId) {
    // Can't match to an order without reference_id
    console.warn('[zoho-webhook] No reference_id in event:', eventType)
    return new Response(JSON.stringify({ ok: true, skipped: 'no reference_id' }), { status: 200 })
  }

  const sbHeaders = {
    'Content-Type':  'application/json',
    apikey:          serviceKey,
    Authorization:   `Bearer ${serviceKey}`,
    Prefer:          'return=minimal',
  }

  // ── Update order by order_number (which we set as reference_id) ────────────
  const updatePayload = { payment_status: newPaymentStatus }
  if (zohoPaymentId) updatePayload.zoho_payment_id = zohoPaymentId

  await fetch(
    `${supabaseUrl}/rest/v1/orders?order_number=eq.${encodeURIComponent(referenceId)}`,
    {
      method: 'PATCH',
      headers: sbHeaders,
      body:    JSON.stringify(updatePayload),
    }
  )

  // ── If paid, also update order status to 'confirmed' ──────────────────────
  if (newPaymentStatus === 'paid') {
    await fetch(
      `${supabaseUrl}/rest/v1/orders?order_number=eq.${encodeURIComponent(referenceId)}`,
      {
        method:  'PATCH',
        headers: sbHeaders,
        body:    JSON.stringify({ status: 'confirmed' }),
      }
    )
  }

  return new Response(JSON.stringify({ ok: true, event: eventType }), { status: 200 })
}
