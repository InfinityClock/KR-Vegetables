/**
 * Vercel Node.js Serverless Function — Create a Zoho Payments hosted checkout session.
 *
 * Uses the Payment Sessions API (NOT payment links) which provides:
 *  - Separate success_url and failure_url
 *  - payment_session_status appended to redirect URL
 *  - Signature on redirect for server-side verification
 *
 * POST /api/zoho-payment
 *   body: { orderId, orderNumber, amount, customerName, customerPhone }
 *
 * Docs: https://www.zoho.com/in/payments/api/v1/payment-session/
 * Redirect: https://payments.zoho.in/hostedpages/{access_key}
 *
 * Required Vercel env vars:
 *   ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN
 *   ZOHO_ACCOUNT_ID   — Zoho Payments → Settings → Account Details
 *   APP_URL           — e.g. https://krvegetables.in
 */

import { getZohoToken } from './_zoho-auth.js'

const BASE_URL = 'https://payments.zoho.in/api/v1'

function corsHeaders(req) {
  const origin  = req.headers?.origin || ''
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

  // ── Get OAuth access token ────────────────────────────────────────────────
  let token
  try { token = await getZohoToken() }
  catch (err) { return res.status(500).json({ error: err.message }) }

  // ── Create payment session ────────────────────────────────────────────────
  // Docs: POST /paymentsessions?account_id={id}
  // success_url and failure_url are inside configurations.hosted_page_parameters
  const payload = {
    amount:      parseFloat(amount).toFixed(2),
    currency:    'INR',
    description: `KR Vegetables Order ${orderNumber}`,
    configurations: {
      hosted_page_parameters: {
        name:               customerName  || 'Customer',
        phone:              customerPhone || '',
        phone_country_code: 'IN',
        description:        `Order ${orderNumber} — KR Vegetables & Fruits`,
        success_url:        `${appUrl}/order-success/${orderId}?payment=success`,
        failure_url:        `${appUrl}/order-success/${orderId}?payment=failed`,
        // udf1 stores orderNumber so it's echoed back in the redirect signature
        udf1: orderNumber || '',
      },
    },
  }

  let zohoRes
  try {
    zohoRes = await fetch(`${BASE_URL}/paymentsessions?account_id=${accountId}`, {
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

  if (!zohoRes.ok || zohoData.code !== 0) {
    console.error('[zoho-payment] Session creation failed:', JSON.stringify(zohoData))
    return res.status(400).json({
      error:   zohoData.message || 'Zoho payment session creation failed',
      details: zohoData,
    })
  }

  // Response: { payments_session: { access_key, payments_session_id, ... } }
  const session           = zohoData.payments_session
  const accessKey         = session?.access_key
  const paymentsSessionId = session?.payments_session_id

  if (!accessKey) {
    return res.status(500).json({ error: 'Zoho returned success but no access_key', raw: zohoData })
  }

  // Redirect customer to the Zoho hosted checkout page
  const paymentUrl = `https://payments.zoho.in/hostedpages/${accessKey}`

  return res.status(200).json({ success: true, paymentUrl, paymentsSessionId })
}
