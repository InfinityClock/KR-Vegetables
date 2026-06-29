/**
 * Vercel Serverless Function — Zoho Pay configuration diagnostic.
 *
 * GET /api/zoho-status
 *   Admin-only. Returns whether each required server-side env var is SET,
 *   as a boolean only — never the actual secret values.
 *
 * Why this exists: the admin Settings panel previously checked
 * `import.meta.env.VITE_ZOHO_CONFIGURED`, a client-bundle env var with no
 * functional relationship to the real secrets (ZOHO_ACCOUNT_ID,
 * ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN), which are
 * correctly server-only and therefore invisible to any client-side check.
 * That meant the panel showed "Not configured" regardless of whether Zoho
 * was actually working — a UI bug, not necessarily a real configuration
 * problem. This endpoint reports the real, current state.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

async function verifyAdmin(req) {
  const auth = req.headers.authorization || ''
  if (!auth.startsWith('Bearer ')) return false
  const token = auth.slice(7)
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: SERVICE_KEY },
  })
  if (!res.ok) return false
  const { app_metadata, email } = await res.json()
  return app_metadata?.role === 'admin' ||
    app_metadata?.role === 'sales' ||
    email === 'admin@krvegetables.in'
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (!await verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const required = ['ZOHO_ACCOUNT_ID', 'ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN']
  const status = {}
  for (const key of required) status[key] = !!process.env[key]

  const configured = required.every((key) => status[key])

  return res.status(200).json({ configured, vars: status })
}
