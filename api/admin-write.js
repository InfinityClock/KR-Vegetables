/**
 * Vercel Edge Function — Admin Write Operations
 * Uses service role key to bypass RLS for all admin write operations.
 *
 * POST /api/admin-write
 *   { table, action, id?, payload? }
 *
 * Allowed tables: products, categories, store_settings
 * Actions: create, update, delete, upsert
 */
export const config = { runtime: 'edge' }

// CORS is evaluated per-request so we never fall back to '*'.
// Admin write operations should only be callable from the configured app origin.
function getCORS(req) {
  const origin  = req?.headers?.get('origin') || ''
  const allowed = process.env.APP_URL || ''
  const isOk    = !allowed
    || origin === allowed
    || /^https?:\/\/localhost(:\d+)?$/.test(origin)
  return {
    'Access-Control-Allow-Origin':  isOk ? (origin || allowed) : allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }
}

const ALLOWED_TABLES = ['products', 'categories', 'store_settings']

async function getRole(req, supabaseUrl, serviceKey) {
  const auth = req.headers.get('Authorization') || ''
  if (!auth.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: serviceKey },
  })
  if (!res.ok) return null
  const { app_metadata, email } = await res.json()
  // Only check app_metadata — it is server-only and cannot be written by users.
  // user_metadata is user-writable via supabase.auth.updateUser() and must never
  // be used for authorization decisions.
  if (app_metadata?.role === 'admin' || email === 'admin@krvegetables.in') return 'admin'
  if (app_metadata?.role === 'sales' || email === 'sales@krvegetables.in') return 'sales'
  return null
}

export default async function handler(req) {
  const cors = getCORS(req)

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors })

  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL

  if (!serviceKey || !supabaseUrl) {
    return new Response(JSON.stringify({ error: 'Missing server env vars' }), { status: 500, headers: cors })
  }

  const userRole = await getRole(req, supabaseUrl, serviceKey)
  if (!userRole) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors })
  }

  let body
  try { body = await req.json() }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: cors }) }

  const { table, action, id, payload } = body

  if (!ALLOWED_TABLES.includes(table)) {
    return new Response(JSON.stringify({ error: `Table '${table}' not allowed` }), { status: 400, headers: cors })
  }

  // Sales role: only allowed to update stock_status on products
  if (userRole === 'sales') {
    const allowedKeys = ['stock_status']
    const payloadKeys = Object.keys(payload || {})
    const isStockUpdate = action === 'update' && table === 'products' && payloadKeys.every(k => allowedKeys.includes(k))
    if (!isStockUpdate) {
      return new Response(JSON.stringify({ error: 'Sales role can only update product stock status' }), { status: 403, headers: cors })
    }
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

  try {
    let res, data

    if (action === 'create') {
      res  = await sb(table, { method: 'POST', body: JSON.stringify(payload) })
      data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Insert failed')
      return new Response(JSON.stringify(data[0] ?? data), { status: 200, headers: cors })
    }

    if (action === 'update') {
      if (!id) throw new Error('id is required for update')
      res  = await sb(`${table}?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Update failed')
      return new Response(JSON.stringify(data[0] ?? data), { status: 200, headers: cors })
    }

    if (action === 'upsert') {
      const onConflict = body.onConflict || 'id'
      res  = await sb(`${table}?on_conflict=${onConflict}`, {
        method: 'POST',
        headers: { Prefer: 'return=representation,resolution=merge-duplicates' },
        body: JSON.stringify(payload),
      })
      data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Upsert failed')
      return new Response(JSON.stringify(data[0] ?? data), { status: 200, headers: cors })
    }

    if (action === 'delete') {
      if (!id) throw new Error('id is required for delete')
      res = await sb(`${table}?id=eq.${id}`, {
        method:  'DELETE',
        headers: { Prefer: 'return=minimal' },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || 'Delete failed')
      }
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: cors })
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: cors })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: cors })
  }
}
