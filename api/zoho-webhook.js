/**
 * POST /api/zoho-webhook
 * Receives Zoho Payments webhook events and updates order payment_status in DB.
 *
 * Required Vercel env vars:
 *   ZOHO_WEBHOOK_SECRET  — from Zoho Payments → Settings → Webhooks → Signing Key
 *   SUPABASE_SERVICE_ROLE_KEY
 *   VITE_SUPABASE_URL
 *
 * In Zoho Payments dashboard, register:
 *   URL:    https://<your-domain>/api/zoho-webhook
 *   Events: payment.success, payment.failed
 */
export const config = { runtime: 'edge' }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Zoho-Signature',
  'Content-Type': 'application/json',
}

async function verifySignature(secret, payload, signature) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const computed = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, '0')).join('')
  return computed === signature
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const webhookSecret = process.env.ZOHO_WEBHOOK_SECRET

  const rawBody = await req.text()

  // Verify signature if secret is configured
  if (webhookSecret) {
    const signature = req.headers.get('X-Zoho-Signature') || ''
    const valid = await verifySignature(webhookSecret, rawBody, signature)
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401, headers: corsHeaders })
    }
  }

  let event
  try { event = JSON.parse(rawBody) }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsHeaders }) }

  const eventType = event.event_type || event.type
  const payment   = event.data?.payment || event.payment || {}

  // Map Zoho reference_id (which we set to orderNumber) back to our order
  const referenceId = payment.reference_id || payment.reference_number
  const paymentId   = payment.payment_id || payment.id

  if (!referenceId) {
    return new Response(JSON.stringify({ ok: true, skipped: 'no reference_id' }), { status: 200, headers: corsHeaders })
  }

  const newStatus = eventType === 'payment.success' ? 'paid' : 'failed'

  // Update order payment_status by order_number
  await fetch(
    `${supabaseUrl}/rest/v1/orders?order_number=eq.${referenceId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        payment_status: newStatus,
        ...(paymentId ? { zoho_payment_id: paymentId } : {}),
      }),
    }
  )

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders })
}
