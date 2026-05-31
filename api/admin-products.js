/**
 * Vercel Edge Function — Admin Product Management
 * Uses service role key to bypass RLS for all product write operations.
 *
 * GET  /api/admin-products                  → list all products
 * POST /api/admin-products
 *   { action: 'create', payload }           → insert product
 *   { action: 'update', id, payload }       → update product
 *   { action: 'delete', id }               → delete product
 *   { action: 'toggle_active', id, value } → set is_active
 */
export const config = { runtime: 'edge' }

function corsHeaders(req) {
  const origin  = req?.headers?.get('origin') || ''
  const allowed = process.env.APP_URL || ''
  const isOk    = !allowed
    || origin === allowed
    || /^https?:\/\/localhost(:\d+)?$/.test(origin)
  return {
    'Access-Control-Allow-Origin':  isOk ? (origin || allowed || '*') : allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }
}

async function verifyAdmin(req, supabaseUrl, serviceKey) {
  const auth = req.headers.get('Authorization') || ''
  if (!auth.startsWith('Bearer ')) return false
  const token = auth.slice(7)
  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: serviceKey },
  })
  if (!res.ok) return false
  const { app_metadata, email } = await res.json()
  // Only check app_metadata — it is server-only and cannot be written by the user.
  // user_metadata is user-writable and must not be used for authorization.
  return (
    app_metadata?.role === 'admin' ||
    app_metadata?.role === 'sales' ||
    email === process.env.ADMIN_EMAIL
  )
}

export default async function handler(req) {
  const cors = corsHeaders(req)

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL

  if (!serviceKey || !supabaseUrl) {
    return new Response(JSON.stringify({ error: 'Missing server env vars' }), { status: 500, headers: cors })
  }

  // All endpoints require admin authentication
  if (!await verifyAdmin(req, supabaseUrl, serviceKey)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors })
  }

  const sb = (path, opts = {}) =>
    fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: 'return=representation',
        ...opts.headers,
      },
    })

  // ── GET: list products ──────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const select = 'id,name,description,unit,price,offer_price,offer_label,image_url,stock_status,is_featured,is_active,category_id,created_at'
    const res = await sb(`products?select=${select}&order=created_at.desc`)
    const data = await res.json()
    return new Response(JSON.stringify(data), { status: res.status, headers: cors })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: cors })
  }

  let body
  try { body = await req.json() }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: cors }) }

  const { action, id, payload } = body

  // ── CREATE ──────────────────────────────────────────────────────────────────
  if (action === 'create') {
    const res = await sb('products', { method: 'POST', body: JSON.stringify(payload) })
    const data = await res.json()
    if (!res.ok) return new Response(JSON.stringify({ error: data?.message || 'Insert failed' }), { status: 400, headers: cors })
    return new Response(JSON.stringify(data[0]), { status: 200, headers: cors })
  }

  // ── UPDATE ──────────────────────────────────────────────────────────────────
  if (action === 'update') {
    if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: cors })
    const res = await sb(`products?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
    const data = await res.json()
    if (!res.ok) return new Response(JSON.stringify({ error: data?.message || 'Update failed' }), { status: 400, headers: cors })
    return new Response(JSON.stringify(data[0]), { status: 200, headers: cors })
  }

  // ── TOGGLE ACTIVE ───────────────────────────────────────────────────────────
  if (action === 'toggle_active') {
    if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: cors })
    const res = await sb(`products?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: body.value }),
    })
    const data = await res.json()
    if (!res.ok) return new Response(JSON.stringify({ error: data?.message || 'Toggle failed' }), { status: 400, headers: cors })
    return new Response(JSON.stringify(data[0]), { status: 200, headers: cors })
  }

  // ── DELETE ──────────────────────────────────────────────────────────────────
  if (action === 'delete') {
    if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: cors })
    const res = await sb(`products?id=eq.${id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return new Response(JSON.stringify({ error: data?.message || 'Delete failed' }), { status: 400, headers: cors })
    }
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: cors })
  }

  return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: cors })
}
