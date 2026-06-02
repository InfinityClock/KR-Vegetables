/**
 * Supabase Edge Function — auto-expire-offers
 *
 * Clears offer_price, offer_label, and offer_expires_at from any product
 * whose offer_expires_at timestamp is in the past.
 *
 * Schedule this function in Supabase Dashboard:
 *   Edge Functions → auto-expire-offers → Schedule → Cron: 0 * * * *
 *   (runs every hour on the hour)
 *
 * It is also called hourly by the Vercel cron job at /api/expire-offers
 * as a backup, so offers expire reliably even if Supabase scheduling
 * is not configured.
 */
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')              ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('products')
      .update({ offer_price: null, offer_label: null, offer_expires_at: null })
      .lt('offer_expires_at', now)
      .not('offer_expires_at', 'is', null)
      .select('id, name')

    if (error) throw error

    const count = data?.length ?? 0
    console.log(`[auto-expire-offers] Expired ${count} offer(s) at ${now}`)

    return new Response(
      JSON.stringify({
        success:       true,
        expired_count: count,
        products:      data?.map((p) => p.name) ?? [],
        ran_at:        now,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[auto-expire-offers] Error:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
