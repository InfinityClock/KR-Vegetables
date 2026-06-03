-- ─────────────────────────────────────────────────────────────────────────────
-- 016_push_notification_upgrades.sql
--
-- Phase A: Link push subscribers to customer identities
--   Adds customer_phone, user_agent, platform columns to push_subscriptions.
--
-- Phase B: Notification history
--   Creates notification_logs table to record every broadcast.
--
-- HOW TO APPLY:
--   1. Supabase dashboard → SQL Editor → Paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Phase A: Customer linkage ─────────────────────────────────────────────────

ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS user_agent     TEXT,
  ADD COLUMN IF NOT EXISTS platform       TEXT,   -- 'android' | 'ios' | 'desktop'
  ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ DEFAULT now();

-- Index for customer phone lookup (send targeted notifications to a customer)
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_customer_phone
  ON push_subscriptions(customer_phone)
  WHERE customer_phone IS NOT NULL;

-- ── Phase B: Notification history ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notification_logs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT        NOT NULL,
  body             TEXT        NOT NULL,
  url              TEXT        DEFAULT '/',
  target           TEXT        DEFAULT 'all',   -- 'all' | 'recent_buyers' | 'cod_customers' | phone number
  recipient_count  INT         DEFAULT 0,
  sent_count       INT         DEFAULT 0,
  failed_count     INT         DEFAULT 0,
  sent_by          TEXT,                        -- admin email
  sent_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write notification logs
CREATE POLICY "notif_logs_admin" ON notification_logs
  FOR ALL USING (is_admin());
