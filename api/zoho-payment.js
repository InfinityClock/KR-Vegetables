/**
 * Vercel Node.js Serverless Function — Create a Zoho Payments hosted checkout session.
 *
 * Docs: https://www.zoho.com/in/payments/api/v1/payment-session/
 *
 * Security:
 *   - Amount is fetched from the database using orderId — never from the client.
 *   - A HMAC-SHA256 confirm token (signed with PAYMENT_CONFIRM_SECRET) is embedded
 *     in the success_url so that confirm-payment.js can verify the redirect is genuine.
 *   - Order number is sent in both udf1 (hosted page) AND meta_data (server-side)
 *     so it is available in payment.succeeded webhook events.
 */

import { createHmac } from 'crypto'
import { getZohoToken } from './_zoho-auth.js'

const BASE_URL = 'https://payments.zoho.in/api/v1'

function corsHeaders(req) {
  const origin  = req.headers?.origin || ''
  const allowed = process.env.APP_URL || ''
  const isOk    = !allowed
    || origin === allowed
    || /^https?:\/\/localhost(:\d+)?$/.test(origin)
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

  const accountId     = process.env.ZOHO_ACCOUNT_ID
  const appUrl        = process.env.APP_URL || 'https://krvegetables.in'
  const serviceKey    = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl   = process.env.VITE_SUPABASE_URL
  const confirmSecret = process.env.PAYMENT_CONFIRM_SECRET

  if (!accountId)              return res.status(500).json({ error: 'ZOHO_ACCOUNT_ID env var is not set.' })
  if (!serviceKey || !supabaseUrl) return res.status(500).json({ error: 'Supabase env vars are not set.' })
  if (!confirmSecret)          return res.status(500).json({ error: 'PAYMENT_CONFIRM_SECRET env var is not set.' })

  const { orderId, orderNumber, customerName, customerPhone } = req.body ?? {}
  if (!orderId) return res.status(400).json({ error: 'orderId is required' })

  // ── Fetch authoritative order total from DB — never trust client-supplied amount ──
  let amount
  try {
    const orderRes  = await fetch(
      `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&select=total_amount,payment_status`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    )
    const orderData = await orderRes.json()
    const order     = Array.isArray(orderData) ? orderData[0] : null
    if (!order)                          return res.status(404).json({ error: 'Order not found' })
    if (order.payment_status === 'paid') return res.status(409).json({ error: 'Order is already paid' })
    amount = parseFloat(parseFloat(order.total_amount).toFixed(2))
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch order amount', detail: err.message })
  }

  // ── HMAC confirm token — embedded in success_url; verified by confirm-payment.js ──
  const confirmToken = createHmac('sha256', confirmSecret).update(orderId).digest('hex')

  // ── Get OAuth access token ─────────────────────────────────────────────────
  let token
  try { token = await getZohoToken() }
  catch (err) { return res.status(500).json({ error: err.message }) }

  // ── Build payload ──────────────────────────────────────────────────────────
  // Both top-level `description` and `hosted_page_parameters.description` are
  // required by the API (per Zoho docs).
  // `meta_data` carries the order_number server-side so it appears in
  // payment.succeeded webhook events (unlike udf1 which is browser-only).
  const description = 'KR Vegetables Order'

  const payload = {
    amount,
    currency:    'INR',
    description,
    ...(orderNumber && {
      meta_data: [{ key: 'order_number', value: String(orderNumber) }],
    }),
    configurations: {
      hosted_page_parameters: {
        description,
        success_url: `${appUrl}/order-success/${orderId}?payment=success&ct=${confirmToken}`,
        failure_url: `${appUrl}/order-success/${orderId}?payment=failed`,
        ...(customerName  && { name: customerName }),
        ...(customerPhone && { phone: customerPhone, phone_country_code: 'IN' }),
        // udf1 is passed through hosted page for widgets/links; meta_data is
        // the server-side equivalent that survives into webhook payloads.
        ...(orderNumber && { udf1: String(orderNumber) }),
      },
    },
  }

  // ── Call Zoho API ──────────────────────────────────────────────────────────
  let zohoRes
  try {
    zohoRes = await fetch(`${BASE_URL}/paymentsessions?account_id=${accountId}`, {
      method:  'POST',
      headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
  } catch (err) {
    return res.status(502).json({ error: 'Failed to reach Zoho Payments API', detail: err.message })
  }

  const zohoData = await zohoRes.json()

  if (!zohoRes.ok || zohoData.code !== 0) {
    return res.status(400).json({
      error:   zohoData.message || 'Zoho payment session creation failed',
      details: zohoData,
    })
  }

  // Per docs, all session fields are nested under payments_session:
  // { code: 0, payments_session: { access_key, payments_session_id, ... } }
  const session           = zohoData.payments_session ?? {}
  const accessKey         = session.access_key         ?? zohoData.access_key         // fallback for any API version differences
  const paymentsSessionId = session.payments_session_id ?? zohoData.payments_session_id

  if (!accessKey) {
    return res.status(500).json({ error: 'Zoho returned success but no access_key', raw: zohoData })
  }

  // Hosted checkout URL — constructed from the access_key per Zoho docs
  const paymentUrl = `https://payments.zoho.in/hostedpages/${accessKey}`
  return res.status(200).json({ success: true, paymentUrl, paymentsSessionId })
}
