-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 018 — COD Payment Tracking
--
-- Adds two audit columns to orders:
--   collected_at  — timestamp when cash was physically collected
--   collected_by  — email/name of the admin/staff who collected it
--
-- These are NULL for online payments and for COD orders not yet collected.
-- When admin taps "Mark Cash Collected", both are set atomically alongside
-- payment_status being updated to 'paid'.
--
-- Also adds a partial index for the "COD Pending Collection" dashboard query
-- so it stays fast as the orders table grows.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS collected_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS collected_by  TEXT;

-- Partial index: only indexes the rows we care about for the pending-COD widget.
-- Very small index size since it shrinks as orders are collected.
CREATE INDEX IF NOT EXISTS idx_orders_cod_pending
  ON orders (placed_at DESC)
  WHERE payment_method = 'cod' AND payment_status = 'pending';

-- Composite index for the revenue dashboard query
-- (filter by payment_status='paid', aggregate total_amount by date)
CREATE INDEX IF NOT EXISTS idx_orders_paid_revenue
  ON orders (payment_status, placed_at DESC)
  WHERE payment_status = 'paid';

COMMENT ON COLUMN orders.collected_at IS
  'Timestamp when cash was physically handed over. NULL until COD order is marked collected.';
COMMENT ON COLUMN orders.collected_by IS
  'Email or display name of the staff member who collected the cash.';
