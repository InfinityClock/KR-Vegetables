-- ─────────────────────────────────────────────────────────────────────────────
-- 017_push_subscriber_type.sql
--
-- Adds subscriber_type to push_subscriptions to distinguish admin devices
-- from customer devices. This allows "new order" alerts to go to all admin
-- subscribers without also sending to customers.
--
-- HOW TO APPLY:
--   1. Supabase dashboard → SQL Editor → Paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS subscriber_type TEXT DEFAULT 'customer'
  CHECK (subscriber_type IN ('customer', 'admin'));

-- Index for fast admin-only lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_type
  ON push_subscriptions(subscriber_type);
