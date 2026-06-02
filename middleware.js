/**
 * Vercel Edge Middleware — IP-based rate limiting for all /api/* endpoints.
 *
 * Uses an in-memory sliding-window counter per IP per endpoint group.
 * In-memory means it's per-Edge-instance (not distributed), but it effectively
 * handles the dominant abuse patterns: single-IP spam and bot floods.
 *
 * Limits (per 60-second window):
 *   /api/create-order    — 10 req / min  (order creation)
 *   /api/zoho-payment    — 10 req / min  (payment session creation)
 *   /api/confirm-payment — 20 req / min  (payment confirmation)
 *   /api/track-order     — 60 req / min  (public order tracking)
 *   all other /api/*     — 120 req / min (admin endpoints, push, etc.)
 */

export const config = {
  matcher: '/api/:path*',
}

// ── Rate limit table ─────────────────────────────────────────────────────────
// key → { count, windowStart }
const store = new Map()

const LIMITS = [
  { prefix: '/api/create-order',    max: 10,  window: 60_000 },
  { prefix: '/api/zoho-payment',    max: 10,  window: 60_000 },
  { prefix: '/api/confirm-payment', max: 20,  window: 60_000 },
  { prefix: '/api/track-order',     max: 60,  window: 60_000 },
  { prefix: '/api/',                max: 120, window: 60_000 },  // catch-all
]

function getLimit(pathname) {
  for (const rule of LIMITS) {
    if (pathname.startsWith(rule.prefix)) return rule
  }
  return null
}

function getIp(request) {
  // Vercel forwards the real client IP in x-forwarded-for
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

export default function middleware(request) {
  const { pathname } = new URL(request.url)
  const rule = getLimit(pathname)
  if (!rule) return  // not an API route — pass through

  const ip   = getIp(request)
  const key  = `${ip}:${rule.prefix}`
  const now  = Date.now()
  const entry = store.get(key)

  if (!entry || now - entry.windowStart > rule.window) {
    // New window
    store.set(key, { count: 1, windowStart: now })
    return  // pass through
  }

  entry.count++

  if (entry.count > rule.max) {
    const retryAfter = Math.ceil((entry.windowStart + rule.window - now) / 1000)
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please slow down and try again shortly.',
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After':  String(retryAfter),
          'X-RateLimit-Limit':     String(rule.max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset':     String(Math.ceil((entry.windowStart + rule.window) / 1000)),
        },
      }
    )
  }

  // Within limit — pass through (optionally add headers for transparency)
  return  // undefined = pass through
}
