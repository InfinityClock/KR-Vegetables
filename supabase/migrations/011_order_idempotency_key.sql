-- ─────────────────────────────────────────────────────────────────────────────
-- 011_order_idempotency_key.sql
--
-- PROBLEM: create-order has no idempotency mechanism. A double-tap or a
--   client retry on network timeout can create duplicate orders with identical
--   contents. The only server-side guard was the button's "placing" state,
--   which is client-only.
--
-- FIX: Add an idempotency_key column (nullable, unique) to orders.
--   The client generates a UUID at checkout start and sends it with the
--   order payload. The server checks whether an order with that key already
--   exists and returns the existing order if so (idempotent response).
--   Old orders without a key are unaffected (column is nullable).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Partial unique index: only enforce uniqueness when the key is not null.
-- This allows old orders (null key) without constraint conflicts.
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key
  ON orders(idempotency_key)
  WHERE idempotency_key IS NOT NULL;
