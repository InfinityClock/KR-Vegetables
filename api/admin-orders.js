/**
 * Vercel Serverless Function — Admin Order Management
 * Runs on the server using the service role key → bypasses all RLS.
 * The service role key is NEVER sent to the browser.
 *
 * POST /api/admin-orders
 *   body: { action: 'update_status', orderId, newStatus, trackingMessage }
 *
 * GET  /api/admin-orders?status=all
 *   Returns all orders with items and customer info (no RLS restriction)
 */

export const config = { runtime: 'edge' }

export default async function handler(req) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL

  if (!serviceKey) {
    return new Response(
      JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY is not set in Vercel environment variables.' }),
      { status: 500, headers: corsHeaders }
    )
  }

  const sbHeaders = {
    'Content-Type': 'application/json',
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Prefer': 'return=representation',
  }

  // ── GET: fetch all orders ────────────────────────────────────────────────
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const status = url.searchParams.get('status') || 'all'

    let ordersUrl = `${supabaseUrl}/rest/v1/orders?select=*,customers(full_name,phone),order_items(*),addresses(*)&order=placed_at.desc`
    if (status !== 'all') {
      ordersUrl += `&status=eq.${status}`
    }

    const res = await fetch(ordersUrl, { headers: sbHeaders })
    const data = await res.json()
    return new Response(JSON.stringify(data), { status: res.status, headers: corsHeaders })
  }

  // ── POST: actions ────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    let body
    try { body = await req.json() } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsHeaders })
    }

    const { action, orderId, newStatus, trackingMessage } = body

    // ── update_status ──────────────────────────────────────────────────────
    if (action === 'update_status') {
      if (!orderId || !newStatus) {
        return new Response(
          JSON.stringify({ error: 'orderId and newStatus are required' }),
          { status: 400, headers: corsHeaders }
        )
      }

      // 1. Update the order
      const updateRes = await fetch(
        `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`,
        { method: 'PATCH', headers: sbHeaders, body: JSON.stringify({ status: newStatus }) }
      )
      const updated = await updateRes.json()

      if (!updateRes.ok) {
        return new Response(
          JSON.stringify({ error: 'Order update failed', details: updated }),
          { status: 400, headers: corsHeaders }
        )
      }

      // 2. Insert tracking entry
      if (trackingMessage) {
        await fetch(`${supabaseUrl}/rest/v1/order_tracking`, {
          method: 'POST',
          headers: sbHeaders,
          body: JSON.stringify({
            order_id: orderId,
            status: newStatus,
            message: trackingMessage,
            updated_by: 'admin',
          }),
        })
      }

      return new Response(
        JSON.stringify({ success: true, order: updated[0] ?? null }),
        { status: 200, headers: corsHeaders }
      )
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: corsHeaders })
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders })
}
