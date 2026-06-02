/**
 * Vercel Cron Job — expire-offers
 *
 * Calls the Supabase auto-expire-offers Edge Function hourly.
 * Acts as a reliable backup if Supabase's own scheduler is not configured.
 *
 * Cron schedule: 0 * * * *  (every hour on the hour)
 * Configured in vercel.json under "crons".
 *
 * This endpoint is also protected by a shared secret so it cannot be
 * triggered arbitrarily from the internet.
 */
export const config = { runtime: 'edge' }

export default async function handler(req) {
  // Vercel calls cron jobs with the Authorization header set to
  // Bearer <CRON_SECRET> — verify it to prevent unauthorised triggers.
  const cronSecret   = process.env.CRON_SECRET
  const authHeader   = req.headers.get('authorization') || ''
  const providedKey  = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (cronSecret && providedKey !== cronSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl    = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/functions/v1/auto-expire-offers`,
      {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      }
    )
    const data = await res.json()
    return new Response(JSON.stringify({ ok: true, ...data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
