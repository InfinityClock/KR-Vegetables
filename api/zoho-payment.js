/**
 * POST /api/zoho-payment
 * Creates a Zoho Payments payment link using server-side API key.
 *
 * Required Vercel env vars:
 *   ZOHO_PAYMENTS_API_KEY   — from Zoho Payments → Settings → API Keys
 *   ZOHO_ORG_ID             — from Zoho Payments → Settings → Organisation
 *   VITE_APP_URL            — e.g. https://kr-vegetables.vercel.app
 *
 * Zoho Payments Docs: https://www.zoho.com/payments/api/
 */
export const config = { runtime: 'edge' }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  const apiKey  = process.env.ZOHO_PAYMENTS_API_KEY
  const orgId   = process.env.ZOHO_ORG_ID
  const appUrl  = process.env.VITE_APP_URL || 'https://kr-vegetables.vercel.app'

  if (!apiKey || !orgId) {
    return new Response(
      JSON.stringify({ error: 'ZOHO_PAYMENTS_API_KEY and ZOHO_ORG_ID must be set in Vercel env vars' }),
      { status: 500, headers: corsHeaders }
    )
  }

  let body
  try { body = await req.json() }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsHeaders }) }

  const { orderId, orderNumber, amount, customerName, customerPhone } = body

  if (!orderId || !amount) {
    return new Response(JSON.stringify({ error: 'orderId and amount are required' }), { status: 400, headers: corsHeaders })
  }

  // Create payment link via Zoho Payments API
  const zohoRes = await fetch('https://payments.zoho.in/api/v1/paymentlinks', {
    method: 'POST',
    headers: {
      'Authorization': `Zoho-payapikey ${apiKey}`,
      'X-com-zoho-payments-organizationid': orgId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency: 'INR',
      description: `KR Vegetables Order ${orderNumber}`,
      allow_repeated_payments: false,
      send_notification: false,
      customer_details: {
        name: customerName || 'Customer',
        mobile: customerPhone || '',
      },
      success_redirect_url: `${appUrl}/order-success/${orderId}?payment=success`,
      cancel_redirect_url:  `${appUrl}/checkout?payment=cancelled`,
      expire_by: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
      reference_id: orderNumber,
    }),
  })

  const zohoData = await zohoRes.json()

  if (!zohoRes.ok || zohoData.code !== 0) {
    return new Response(
      JSON.stringify({ error: zohoData.message || 'Zoho payment creation failed', details: zohoData }),
      { status: 400, headers: corsHeaders }
    )
  }

  const paymentUrl = zohoData.payment_link?.link_url || zohoData.payment_link?.short_url

  return new Response(
    JSON.stringify({ success: true, paymentUrl, linkId: zohoData.payment_link?.link_id }),
    { status: 200, headers: corsHeaders }
  )
}
