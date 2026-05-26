/**
 * Vercel Node.js Serverless Function — Create a Zoho Payments payment link.
 * Uses OAuth 2.0 (not API key) as required by the Zoho Payments API.
 *
 * POST /api/zoho-payment
 *   body: { orderId, orderNumber, amount, customerName, customerPhone }
 *
 * Required Vercel env vars:
 *   ZOHO_CLIENT_ID       — Zoho Developer Console → ORG client
 *   ZOHO_CLIENT_SECRET   — Zoho Developer Console
 *   ZOHO_REFRESH_TOKEN   — Long-lived refresh token (see setup guide)
 *   ZOHO_ACCOUNT_ID      — Zoho Payments → Settings → Account Details
 *   APP_URL              — e.g. https://krvegetables.in  (no trailing slash)
 *
 * Docs: https://www.zoho.com/in/payments/api/v1/payment-links/
 */

// Node.js runtime (no edge config) — required for module-level token caching

import { getZohoToken } from './_zoho-auth.js'

function corsHeaders(req) {
  const origin  = (req.headers && req.headers.origin) || ''
  const allowed = process.env.APP_URL || ''
  const isOk    = !allowed || origin === allowed
    || /^https?:\/\/localhost(:\d+)?$/.test(origin)
    || origin.endsWith('.vercel.app')
  return {
    'Access-Control-Allow-Origin':  isOk ? (origin || allowed || '*') : allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}

const BASE_URL = 'https://payments.zoho.in/api/v1'

export default async function handler(req, res) {
  const headers = corsHeaders(req)
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v))

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' })

  const accountId = process.env.ZOHO_ACCOUNT_ID
  const appUrl    = process.env.APP_URL || process.env.VITE_APP_URL || 'https://kr-vegetables.vercel.app'

  if (!accountId) {
    return res.status(500).json({ error: 'ZOHO_ACCOUNT_ID is not set in Vercel environment variables.' })
  }

  const { orderId, orderNumber, amount, customerName, customerPhone } = req.body ?? {}

  if (!orderId || !amount) {
    return res.status(400).json({ error: 'orderId and amount are required' })
  }

  // ── Get OAuth access token (auto-refreshed if expired) ──────────────────────
  let token
  try {
    token = await getZohoToken()
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }

  // ── Payment link expiry: 30 minutes from now, in yyyy-MM-dd format ───────────
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  // ── Create payment link ───────────────────────────────────────────────────────
  // Docs: POST /paymentlinks?account_id={account_id}
  // Auth: Authorization: Zoho-oauthtoken {access_token}
  const payload = {
    amount,
    currency:     'INR',
    description:  `KR Vegetables Order ${orderNumber}`,
    reference_id: orderNumber,               // used to match webhook back to our order
    return_url:   `${appUrl}/order-success/${orderId}?payment=success`,
    expires_at:   expiresAt,                 // yyyy-MM-dd
    notify_customer: {
      email: false,
      sms:   false,                          // SMS only for Indian numbers — we handle it
    },
  }

  // Add customer phone if available
  if (customerPhone) {
    payload.phone              = customerPhone
    payload.phone_country_code = 'IN'
  }

  let zohoRes
  try {
    zohoRes = await fetch(`${BASE_URL}/paymentlinks?account_id=${accountId}`, {
      method:  'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    return res.status(502).json({ error: 'Failed to reach Zoho Payments API', detail: err.message })
  }

  const zohoData = await zohoRes.json()

  // Zoho returns code:0 for success
  if (!zohoRes.ok || zohoData.code !== 0) {
    console.error('[zoho-payment] API error:', JSON.stringify(zohoData))
    return res.status(400).json({
      error:   zohoData.message || 'Zoho payment link creation failed',
      details: zohoData,
    })
  }

  // Response shape: { code: 0, message: "...", payment_links: { url, payment_link_id, ... } }
  const paymentUrl  = zohoData.payment_links?.url
  const linkId      = zohoData.payment_links?.payment_link_id

  if (!paymentUrl) {
    return res.status(500).json({ error: 'Zoho returned success but no payment URL', raw: zohoData })
  }

  return res.status(200).json({ success: true, paymentUrl, linkId })
}
