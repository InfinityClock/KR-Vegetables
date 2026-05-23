/**
 * Shared CORS helper for all Vercel Edge Functions.
 *
 * Allowed origins:
 *   1. The production domain  → process.env.APP_URL  (set in Vercel: https://yourdomain.com)
 *   2. Any Vercel preview URL → *.vercel.app
 *   3. Localhost              → for local development
 *
 * Add APP_URL=https://your-custom-domain.com in Vercel → Settings → Env Vars.
 */

const ALLOWED_ORIGINS = [
  process.env.APP_URL,
  // Vercel auto-deployment domain (set automatically by Vercel)
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean)

export function getCorsHeaders(req) {
  const origin = req.headers.get('origin') || ''

  // Allow localhost in all environments (development)
  const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin)

  // Allow *.vercel.app (preview deployments)
  const isVercelPreview = /^https:\/\/[a-z0-9-]+-[a-z0-9]+-[a-z0-9]+\.vercel\.app$/.test(origin)

  // Allow the configured production origin
  const isAllowed = isLocalhost || isVercelPreview || ALLOWED_ORIGINS.includes(origin)

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : (ALLOWED_ORIGINS[0] || '*'),
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  }
}
