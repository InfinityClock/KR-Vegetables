-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 022 — Notification Logs: track per-order pushes
--
-- Until now, push-send.js only logged BROADCAST notifications to
-- notification_logs (the `if (!orderId && ...)` gate in the old code).
-- Every order-status-change push (admin -> customer) and every new-order
-- alert (customer -> admin) was sent fire-and-forget with zero record of
-- whether it actually succeeded or failed.
--
-- This made it structurally impossible to verify the most business-critical
-- notification paths after the fact — exactly the paths an operations team
-- cares about most. This migration adds order_id so those sends can be
-- logged too (paired with the push-send.js change that removes the gate).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE notification_logs
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_notification_logs_order_id
  ON notification_logs(order_id)
  WHERE order_id IS NOT NULL;
