/**
 * Vercel Edge Function — Save (or update) a Web Push subscription.
 * Called by the browser immediately after PushManager.subscribe().
 * No admin auth required — runs for anonymous customers.
 *
 * POST /api/push-subscribe
 *   body: { endpoint, p256dh, auth, orderId? }
 */

export const config = { runtime: 'edge' }

import { getCorsHeaders } from './_cors.js'

export default async function handler(req) {
  const cors = getCorsHeaders(req)

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors })
  }

  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  if (!serviceKey || !supabaseUrl) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers: cors })
  }

  let body
  try { body = await req.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: cors })
  }

  const { endpoint, p256dh, auth, orderId, customerPhone } = body
  if (!endpoint || !p256dh || !auth) {
    return new Response(
      JSON.stringify({ error: 'endpoint, p256dh and auth are required' }),
      { status: 400, headers: cors }
    )
  }

  // Detect platform from User-Agent for subscriber management UI
  const ua = req.headers.get('user-agent') || ''
  const platform = /iphone|ipad/i.test(ua)
    ? 'ios'
    : /android/i.test(ua)
      ? 'android'
      : 'desktop'

  const payload = {
    endpoint,
    p256dh,
    auth,
    user_agent: ua.slice(0, 512),
    platform,
    updated_at: new Date().toISOString(),
  }
  if (orderId)       payload.order_id       = orderId
  if (customerPhone) payload.customer_phone = customerPhone.replace(/\D/g, '').slice(-10)

  // Upsert: if endpoint already exists, update customer_phone + order_id
  const res = await fetch(`${supabaseUrl}/rest/v1/push_subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey':        serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer':        'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const detail = await res.text()
    return new Response(JSON.stringify({ error: 'Database error', detail }), { status: 500, headers: cors })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors })
}
