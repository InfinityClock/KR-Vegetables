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

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL

  if (!serviceKey || !supabaseUrl) {
    return new Response(JSON.stringify({ error: 'Missing server env vars' }), { status: 500, headers: CORS })
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
    return new Response(JSON.stringify(data), { status: res.status, headers: CORS })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS })
  }

  let body
  try { body = await req.json() }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: CORS }) }

  const { action, id, payload } = body

  // ── CREATE ──────────────────────────────────────────────────────────────────
  if (action === 'create') {
    const res = await sb('products', { method: 'POST', body: JSON.stringify(payload) })
    const data = await res.json()
    if (!res.ok) return new Response(JSON.stringify({ error: data?.message || 'Insert failed' }), { status: 400, headers: CORS })
    return new Response(JSON.stringify(data[0]), { status: 200, headers: CORS })
  }

  // ── UPDATE ──────────────────────────────────────────────────────────────────
  if (action === 'update') {
    if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: CORS })
    const res = await sb(`products?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
    const data = await res.json()
    if (!res.ok) return new Response(JSON.stringify({ error: data?.message || 'Update failed' }), { status: 400, headers: CORS })
    return new Response(JSON.stringify(data[0]), { status: 200, headers: CORS })
  }

  // ── TOGGLE ACTIVE ───────────────────────────────────────────────────────────
  if (action === 'toggle_active') {
    if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: CORS })
    const res = await sb(`products?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: body.value }),
    })
    const data = await res.json()
    if (!res.ok) return new Response(JSON.stringify({ error: data?.message || 'Toggle failed' }), { status: 400, headers: CORS })
    return new Response(JSON.stringify(data[0]), { status: 200, headers: CORS })
  }

  // ── DELETE ──────────────────────────────────────────────────────────────────
  if (action === 'delete') {
    if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: CORS })
    const res = await sb(`products?id=eq.${id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return new Response(JSON.stringify({ error: data?.message || 'Delete failed' }), { status: 400, headers: CORS })
    }
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS })
  }

  return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: CORS })
}
