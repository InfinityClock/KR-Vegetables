/**
 * Shared CORS helper for all Vercel Edge Functions.
 *
 * Allowed origins:
 *   1. The production domain  → process.env.APP_URL  (set in Vercel: https://yourdomain.com)
 *   2. The canonical Vercel deployment URL → process.env.VERCEL_URL (set automatically by Vercel)
 *   3. Localhost              → for local development
 *
 * NOTE: The *.vercel.app wildcard was deliberately removed — it allowed any
 * attacker-controlled Vercel project to make credentialed cross-origin requests
 * to all admin API endpoints.
 */

const ALLOWED_ORIGINS = [
  process.env.APP_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean)

export function getCorsHeaders(req) {
  const origin = req.headers.get('origin') || ''

  // Allow localhost in all environments (development)
  const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin)

  // Allow only the explicitly configured production/preview origins
  const isAllowed = isLocalhost || ALLOWED_ORIGINS.includes(origin)

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : (ALLOWED_ORIGINS[0] || ''),
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  }
}
