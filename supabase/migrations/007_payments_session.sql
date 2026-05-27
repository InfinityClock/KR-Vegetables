-- Add payments_session_id column to orders table for Zoho Payment Sessions tracking.
-- This stores the payments_session_id returned by the Zoho Payments Sessions API
-- so we can correlate webhook events and verify redirect signatures.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payments_session_id TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_payments_session_id
  ON orders(payments_session_id)
  WHERE payments_session_id IS NOT NULL;
