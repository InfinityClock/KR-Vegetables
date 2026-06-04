/**
 * Vercel Serverless Function — Push Notification Diagnostics
 *
 * GET /api/push-test
 *   Returns full diagnostic info: VAPID config, subscribers, key validation.
 *   Use this to pinpoint why push notifications are not working.
 *
 * POST /api/push-test
 *   Sends a REAL test push to the first available subscriber and returns
 *   the exact success/error response from the push service.
 */

import webPush from 'web-push'

const SUPABASE_URL   = process.env.VITE_SUPABASE_URL
const SERVICE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY
const VAPID_PUBLIC   = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE  = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT  = process.env.VAPID_SUBJECT  || 'mailto:admin@krvegetables.in'
const VITE_VAPID_PUB = process.env.VITE_VAPID_PUBLIC_KEY  // frontend key

async function verifyAdmin(req) {
  const auth = req.headers.authorization || ''
  if (!auth.startsWith('Bearer ')) return false
  const token = auth.slice(7)
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: SERVICE_KEY },
  })
  if (!res.ok) return false
  const { app_metadata, email } = await res.json()
  return app_metadata?.role === 'admin' ||
    app_metadata?.role === 'sales' ||
    email === 'admin@krvegetables.in'
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(204).end()

  if (!await verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // ── STEP 1: Check VAPID configuration ─────────────────────────────────────
  const vapidOk = !!(VAPID_PUBLIC && VAPID_PRIVATE)
  const keysMatch = VAPID_PUBLIC && VITE_VAPID_PUB && VAPID_PUBLIC === VITE_VAPID_PUB

  const diagnostics = {
    vapid: {
      backend_public_key_set:   !!VAPID_PUBLIC,
      backend_private_key_set:  !!VAPID_PRIVATE,
      frontend_public_key_set:  !!VITE_VAPID_PUB,
      keys_match:               keysMatch,
      subject:                  VAPID_SUBJECT,
      // Show first 20 chars of each key (safe to expose, not a secret)
      backend_key_preview:      VAPID_PUBLIC  ? VAPID_PUBLIC.slice(0, 20)  + '…' : null,
      frontend_key_preview:     VITE_VAPID_PUB ? VITE_VAPID_PUB.slice(0, 20) + '…' : null,
      status: !vapidOk
        ? '❌ VAPID keys missing from Vercel environment variables'
        : !keysMatch
          ? '⚠️  BACKEND and FRONTEND VAPID public keys DO NOT MATCH — this will cause UnauthorizedRegistration errors'
          : '✅ VAPID keys configured and matching',
    },
    supabase: {
      url_set:      !!SUPABASE_URL,
      service_key_set: !!SERVICE_KEY,
    },
  }

  // ── STEP 2: Count and inspect subscriptions ────────────────────────────────
  let subscriberInfo = null
  try {
    const sbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/push_subscriptions?select=id,endpoint,platform,subscriber_type,customer_phone,created_at&order=created_at.desc&limit=10`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    )
    const subs = await sbRes.json()
    subscriberInfo = {
      count: Array.isArray(subs) ? subs.length : 'query_failed',
      query_ok: sbRes.ok,
      http_status: sbRes.status,
      // Show subscriber info without exposing encryption keys
      subscribers: Array.isArray(subs) ? subs.map(s => ({
        id:               s.id,
        platform:         s.platform,
        subscriber_type:  s.subscriber_type,
        has_phone:        !!s.customer_phone,
        endpoint_preview: s.endpoint ? s.endpoint.slice(0, 50) + '…' : null,
        created_at:       s.created_at,
      })) : subs,
    }
  } catch (err) {
    subscriberInfo = { error: err.message }
  }

  diagnostics.subscribers = subscriberInfo

  // ── If GET request, return diagnostics only (no test push) ─────────────────
  if (req.method !== 'POST') {
    return res.status(200).json({
      mode: 'diagnostic_only',
      diagnostics,
      next_step: 'POST this endpoint to send a real test push to the first subscriber',
    })
  }

  // ── STEP 3: Attempt a real test push ──────────────────────────────────────
  if (!vapidOk) {
    return res.status(200).json({
      diagnostics,
      test_push: { skipped: true, reason: 'VAPID keys not configured' },
    })
  }

  // Fetch the first subscriber (preferably admin type)
  let testSub = null
  try {
    const res2 = await fetch(
      `${SUPABASE_URL}/rest/v1/push_subscriptions?select=id,endpoint,p256dh,auth,platform,subscriber_type&order=created_at.desc&limit=1`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    )
    const subs = await res2.json()
    testSub = Array.isArray(subs) && subs.length > 0 ? subs[0] : null
  } catch {}

  if (!testSub) {
    return res.status(200).json({
      diagnostics,
      test_push: { skipped: true, reason: 'No subscribers found in push_subscriptions table' },
    })
  }

  // Send the test push
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)

  const testPayload = JSON.stringify({
    title: '✅ Test Push Working!',
    body:  'Push notifications are correctly configured.',
    url:   '/admin/notifications',
    icon:  '/favicon.jpg',
    badge: '/favicon.jpg',
    tag:   'push-test',
  })

  let pushResult = null
  try {
    const result = await webPush.sendNotification(
      { endpoint: testSub.endpoint, keys: { p256dh: testSub.p256dh, auth: testSub.auth } },
      testPayload,
      { TTL: 3600 }
    )
    pushResult = {
      success:      true,
      status_code:  result?.statusCode,
      subscriber_type: testSub.subscriber_type,
      platform:        testSub.platform,
      message:      '✅ Test push sent successfully! Check the device for the notification.',
    }
  } catch (err) {
    pushResult = {
      success:      false,
      status_code:  err.statusCode,
      error_body:   err.body || err.message,
      subscriber_type: testSub.subscriber_type,
      platform:        testSub.platform,
      // Translate common push service errors into human-readable fixes
      diagnosis: err.statusCode === 401 || (err.body && err.body.includes('UnauthorizedRegistration'))
        ? '⚠️ UnauthorizedRegistration: VAPID key mismatch. The subscription was created with a different VAPID public key than the one currently in VAPID_PUBLIC_KEY. Regenerate VAPID keys and update BOTH VAPID_PUBLIC_KEY and VITE_VAPID_PUBLIC_KEY in Vercel with the SAME values, then ask users to re-subscribe.'
        : err.statusCode === 404 || err.statusCode === 410
          ? '⚠️ Subscription expired or invalid. This subscription is dead — it will be auto-removed next time push-send runs. Ask the user to re-subscribe.'
          : err.statusCode === 400
            ? '⚠️ Bad Request: check VAPID key format (must be base64url) or payload size.'
            : `⚠️ Unexpected error — status ${err.statusCode}`,
    }
  }

  return res.status(200).json({
    diagnostics,
    test_push: pushResult,
  })
}
