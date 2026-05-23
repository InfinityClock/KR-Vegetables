-- ─── Push Notification Subscriptions ─────────────────────────────────────────
-- Stores Web Push subscriptions for sending notifications.
-- No RLS needed — all reads/writes go through the service role key in Edge Functions.

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint    TEXT        UNIQUE NOT NULL,
  p256dh      TEXT        NOT NULL,
  auth        TEXT        NOT NULL,
  order_id    UUID        REFERENCES orders(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup when sending targeted order-status notifications
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_order_id
  ON push_subscriptions(order_id)
  WHERE order_id IS NOT NULL;
