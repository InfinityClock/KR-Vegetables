/**
 * Vercel Node.js Serverless Function — send Web Push notifications.
 * Uses the `web-push` npm package (requires Node.js crypto — NOT Edge-compatible).
 * No `export const config = { runtime: 'edge' }` — intentionally runs on Node.js.
 *
 * POST /api/push-send
 *   Authorization: Bearer <admin-supabase-jwt>   OR   x-internal-token: <service-key>
 *   body: { title, body, url?, orderId?, tag? }
 *     orderId → send only to that order's subscriber
 *     (no orderId) → broadcast to ALL subscribers
 *
 * GET /api/push-send
 *   Authorization: Bearer <admin-supabase-jwt>
 *   → Returns { total: number } subscriber count
 */

import webPush from 'web-push'

const SUPABASE_URL  = process.env.VITE_SUPABASE_URL
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY
const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@krvegetables.in'

function corsHeaders(req) {
  const origin  = req.headers.origin || ''
  const allowed = process.env.APP_URL || ''
  // No *.vercel.app wildcard — only the configured production origin and localhost
  const isOk = !allowed
    || origin === allowed
    || /^https?:\/\/localhost(:\d+)?$/.test(origin)
  return {
    'Access-Control-Allow-Origin':  isOk ? (origin || allowed || '*') : allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-internal-token',
    'Content-Type': 'application/json',
  }
}

async function verifyAdmin(req) {
  // Internal server-to-server call (e.g. from admin-orders Edge fn)
  if (req.headers['x-internal-token'] === SERVICE_KEY) return true

  const auth = req.headers.authorization || ''
  if (!auth.startsWith('Bearer ')) return false
  const token = auth.slice(7)
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: SERVICE_KEY },
  })
  if (!res.ok) return false
  const { app_metadata, email } = await res.json()
  // Only check app_metadata — it is server-only and cannot be written by users.
  // user_metadata is user-writable via supabase.auth.updateUser() and must never
  // be used for authorization decisions.
  return (
    app_metadata?.role === 'admin' ||
    app_metadata?.role === 'sales' ||
    email === 'admin@krvegetables.in' ||
    email === 'sales@krvegetables.in'
  )
}

export default async function handler(req, res) {
  const headers = corsHeaders(req)
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v))

  if (req.method === 'OPTIONS') return res.status(204).end()

  if (!await verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized' })

  // ── GET: subscriber count ───────────────────────────────────────────────────
  if (req.method === 'GET') {
    const sbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/push_subscriptions?select=count`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          Prefer: 'count=exact',
        },
      }
    )
    const total = parseInt(sbRes.headers.get('content-range')?.split('/')[1] ?? '0', 10)
    return res.status(200).json({ total })
  }

  // ── POST: send notification ─────────────────────────────────────────────────
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return res.status(500).json({ error: 'VAPID keys not configured. Add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to Vercel environment variables.' })
  }

  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)

  const { title, body, url = '/', orderId, tag, target = 'all', customerPhone } = req.body ?? {}
  if (!title || !body) return res.status(400).json({ error: 'title and body are required' })

  // Build subscriber query based on target segment (Phase D: smart targeting)
  // target options: 'all' | 'recent_buyers' | 'cod_customers' | phone number
  let subUrl = `${SUPABASE_URL}/rest/v1/push_subscriptions?select=id,endpoint,p256dh,auth`

  if (orderId) {
    // Order-specific notification (order status updates)
    subUrl += `&order_id=eq.${orderId}`
  } else if (customerPhone) {
    // Targeted to a specific customer by phone
    subUrl += `&customer_phone=eq.${encodeURIComponent(customerPhone)}`
  } else if (target === 'recent_buyers') {
    // Customers who subscribed and also have a recent order (order_id is set)
    subUrl += `&order_id=not.is.null`
  } else if (target === 'cod_customers') {
    // Subscribers who have a linked order that was COD — resolved via order_id join
    // PostgREST join filter: orders.payment_method = cod
    subUrl += `&orders.payment_method=eq.cod`
  }
  // else target='all' → no additional filter (broadcast to everyone)

  const sbRes  = await fetch(subUrl, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  })
  const subs = await sbRes.json()

  if (!Array.isArray(subs) || subs.length === 0) {
    return res.status(200).json({ sent: 0, failed: 0, total: 0, message: 'No subscribers found' })
  }

  const payload = JSON.stringify({
    title,
    body,
    url,
    icon:  '/favicon.jpg',
    badge: '/favicon.jpg',
    tag:   tag ?? `kr-${Date.now()}`,
  })

  let sent = 0, failed = 0
  const staleIds = []

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
          { TTL: 86400 }   // notification lives up to 24 h if device is offline
        )
        sent++
      } catch (err) {
        failed++
        // 410 Gone / 404 Not Found → subscription is dead, remove it
        if (err.statusCode === 410 || err.statusCode === 404) staleIds.push(sub.id)
      }
    })
  )

  // Clean up expired subscriptions (fire-and-forget)
  if (staleIds.length) {
    fetch(
      `${SUPABASE_URL}/rest/v1/push_subscriptions?id=in.(${staleIds.join(',')})`,
      { method: 'DELETE', headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    ).catch(() => {})
  }

  // Phase B: Log to notification_logs (fire-and-forget, non-critical)
  // Only log broadcast notifications (not per-order status pings)
  if (!orderId && title && body) {
    fetch(`${SUPABASE_URL}/rest/v1/notification_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey:         SERVICE_KEY,
        Authorization:  `Bearer ${SERVICE_KEY}`,
        Prefer:         'return=minimal',
      },
      body: JSON.stringify({
        title,
        body,
        url,
        target: target || 'all',
        recipient_count: subs.length,
        sent_count:      sent,
        failed_count:    failed,
      }),
    }).catch(() => {})
  }

  return res.status(200).json({ sent, failed, total: subs.length })
}
