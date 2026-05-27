/**
 * Vercel Node.js Serverless Function — Create a Zoho Payments hosted checkout session.
 *
 * Docs: https://www.zoho.com/in/payments/api/v1/payment-session/
 *
 * POST /paymentsessions?account_id={id}
 *
 * Required fields (from docs):
 *   amount       - double
 *   currency     - "INR"
 *   description  - string, max 500 chars (REQUIRED at top level)
 *   configurations.hosted_page_parameters.description  - string (REQUIRED)
 *   configurations.hosted_page_parameters.success_url  - HTTPS URL (REQUIRED)
 *   configurations.hosted_page_parameters.failure_url  - HTTPS URL (REQUIRED)
 *
 * phone_country_code must be ISO country code "IN" (not "+91")
 *
 * Response (top-level, not nested):
 *   code                 - 0 = success
 *   access_key           - used to build hosted checkout URL
 *   payments_session_id  - session identifier
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
  const appUrl    = process.env.APP_URL || 'https://krvegetables.in'

  if (!accountId) {
    return res.status(500).json({ error: 'ZOHO_ACCOUNT_ID env var is not set.' })
  }

  const { orderId, orderNumber, amount, customerName, customerPhone } = req.body ?? {}
  if (!orderId || !amount) {
    return res.status(400).json({ error: 'orderId and amount are required' })
  }

  // ── Get OAuth access token ─────────────────────────────────────────────────
  let token
  try { token = await getZohoToken() }
  catch (err) { return res.status(500).json({ error: err.message }) }

  // ── Build payload per Zoho docs ────────────────────────────────────────────
  // Both top-level description AND hosted_page_parameters.description are
  // required by the API. Use safe ASCII-only text — no hyphens or special chars.
  const description = 'KR Vegetables Order'

  const payload = {
    amount:      parseFloat(parseFloat(amount).toFixed(2)),
    currency:    'INR',
    description,                    // required, max 500 chars
    configurations: {
      hosted_page_parameters: {
        description,                // required per docs
        success_url: `${appUrl}/order-success/${orderId}?payment=success`,
        failure_url: `${appUrl}/order-success/${orderId}?payment=failed`,
        // Optional: customer name and phone (phone_country_code must be ISO "IN")
        ...(customerName  && { name: customerName }),
        ...(customerPhone && { phone: customerPhone, phone_country_code: 'IN' }),
        // Store order number in udf1 so it comes back in the redirect signature
        ...(orderNumber   && { udf1: orderNumber }),
      },
    },
  }

  console.log('[zoho-payment] Request →', JSON.stringify(payload))

  // ── Call Zoho API ──────────────────────────────────────────────────────────
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
  console.log('[zoho-payment] Response ←', JSON.stringify(zohoData))

  if (!zohoRes.ok || zohoData.code !== 0) {
    return res.status(400).json({
      error:   zohoData.message || 'Zoho payment session creation failed',
      details: zohoData,
    })
  }

  // ── Parse response ─────────────────────────────────────────────────────────
  // Docs show access_key and payments_session_id as top-level fields.
  // Some API versions may nest them under payments_session — handle both.
  const accessKey         = zohoData.access_key          || zohoData.payments_session?.access_key
  const paymentsSessionId = zohoData.payments_session_id || zohoData.payments_session?.payments_session_id

  if (!accessKey) {
    return res.status(500).json({
      error: 'Zoho returned success but no access_key',
      raw:   zohoData,
    })
  }

  const paymentUrl = `https://payments.zoho.in/hostedpages/${accessKey}`

  return res.status(200).json({ success: true, paymentUrl, paymentsSessionId })
}
