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

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

const ALLOWED_TABLES = ['products', 'categories', 'store_settings']

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS })

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL

  if (!serviceKey || !supabaseUrl) {
    return new Response(JSON.stringify({ error: 'Missing server env vars' }), { status: 500, headers: CORS })
  }

  let body
  try { body = await req.json() }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: CORS }) }

  const { table, action, id, payload } = body

  if (!ALLOWED_TABLES.includes(table)) {
    return new Response(JSON.stringify({ error: `Table '${table}' not allowed` }), { status: 400, headers: CORS })
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
      res = await sb(table, { method: 'POST', body: JSON.stringify(payload) })
      data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Insert failed')
      return new Response(JSON.stringify(data[0] ?? data), { status: 200, headers: CORS })
    }

    if (action === 'update') {
      if (!id) throw new Error('id is required for update')
      res = await sb(`${table}?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Update failed')
      return new Response(JSON.stringify(data[0] ?? data), { status: 200, headers: CORS })
    }

    if (action === 'upsert') {
      const onConflict = body.onConflict || 'id'
      res = await sb(`${table}?on_conflict=${onConflict}`, {
        method: 'POST',
        headers: { Prefer: 'return=representation,resolution=merge-duplicates' },
        body: JSON.stringify(payload),
      })
      data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Upsert failed')
      return new Response(JSON.stringify(data[0] ?? data), { status: 200, headers: CORS })
    }

    if (action === 'delete') {
      if (!id) throw new Error('id is required for delete')
      res = await sb(`${table}?id=eq.${id}`, {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || 'Delete failed')
      }
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS })
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: CORS })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: CORS })
  }
}
