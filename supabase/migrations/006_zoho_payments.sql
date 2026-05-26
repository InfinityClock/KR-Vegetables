-- ─── Zoho Payments Support ────────────────────────────────────────────────────
-- 1. Add 'zoho' to the payment_method enum (Razorpay has been removed from the UI)
-- 2. Add zoho_payment_id column to store the Zoho payment reference
-- 3. Add APP_URL-aware success/cancel redirect stored as a note

-- Add 'zoho' to the enum (Postgres allows adding values, not removing)
ALTER TYPE payment_method_enum ADD VALUE IF NOT EXISTS 'zoho';

-- Store Zoho's payment link ID for reconciliation
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS zoho_payment_id TEXT;

-- Index for fast webhook lookup by Zoho payment ID
CREATE INDEX IF NOT EXISTS idx_orders_zoho_payment_id
  ON orders(zoho_payment_id)
  WHERE zoho_payment_id IS NOT NULL;
