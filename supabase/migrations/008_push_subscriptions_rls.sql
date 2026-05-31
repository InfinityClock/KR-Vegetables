-- ─── Enable RLS on push_subscriptions ─────────────────────────────────────────
-- The table stores WebPush endpoint URLs and encryption keys (p256dh, auth).
-- Without RLS any client with the anon key could read all subscription credentials
-- and use them to send arbitrary push notifications to customers.
--
-- All reads/writes to this table go through the service role key in Edge Functions,
-- which bypasses RLS automatically — so no explicit policies are needed.
-- Enabling RLS with no anon/authenticated policies simply blocks direct REST API
-- access from the browser while leaving Edge Functions unaffected.

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
