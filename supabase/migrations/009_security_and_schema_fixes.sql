-- ─────────────────────────────────────────────────────────────────────────────
-- 009_security_and_schema_fixes.sql
--
-- Bundles three independent fixes:
--
--   A. Fix is_admin() RLS function — remove user_metadata (user-writable)
--   B. Add lat/lng columns to addresses — eliminate silent insert failure
--   C. Add missing indexes on orders for performance
--
-- HOW TO APPLY:
--   1. Go to https://supabase.com/dashboard → your KR Vegetables project
--   2. Click "SQL Editor" in the left sidebar
--   3. Paste this entire file and click "Run"
--   4. You should see "Success. No rows returned."
-- ─────────────────────────────────────────────────────────────────────────────


-- ── A. Fix is_admin() ────────────────────────────────────────────────────────
--
-- PROBLEM: The previous version checked user_metadata.role FIRST.
--   user_metadata is writable by any authenticated user via
--   supabase.auth.updateUser({data:{role:'admin'}}), granting full RLS bypass.
--
-- FIX: Check ONLY app_metadata.role (server-only, not user-modifiable) and
--   the authoritative admin email addresses.
--
-- NOTE: Make sure both admin accounts have app_metadata.role set.
--   The UPDATE statements below set it for both addresses. If you already ran
--   migration 002 for krajesh@gmail.com, the first UPDATE is a no-op.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT (
    -- app_metadata is server-only — cannot be written by users.
    -- Check for both admin and sales roles so the sales user can also
    -- read data through RLS (write restrictions are enforced at the API layer).
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'sales')
    OR
    -- Authoritative fallback: known admin email addresses.
    (auth.jwt() ->> 'email') IN ('admin@krvegetables.in', 'sales@krvegetables.in')
  );
$$;

-- Ensure both admin accounts have app_metadata.role set so RLS works
-- even if the email fallback is ever removed.
UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
  WHERE email = 'admin@krvegetables.in';

UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || '{"role": "sales"}'::jsonb
  WHERE email = 'sales@krvegetables.in';


-- ── B. Add lat/lng to addresses ───────────────────────────────────────────────
--
-- PROBLEM: create-order.js inserts lat/lng on every order but the column
--   doesn't exist → silent failure → retry insert without lat/lng → wasted RTT.
--
-- FIX: Add optional columns. Old rows default to NULL. The retry fallback in
--   create-order.js will be removed separately (code change).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE addresses
  ADD COLUMN IF NOT EXISTS lat NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS lng NUMERIC(10, 7);


-- ── C. Performance indexes ────────────────────────────────────────────────────
--
-- orders.placed_at   — admin order list ORDER BY placed_at DESC
-- orders.payment_status — confirm-payment + webhook WHERE payment_status='pending'
-- products.offer_price  — offers queries .not('offer_price','is',null)
-- products.name          — ilike search (partial fix; full GIN index needs
--                          a pg_trgm extension which requires Supabase Pro)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_orders_placed_at
  ON orders(placed_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_payment_status
  ON orders(payment_status);

CREATE INDEX IF NOT EXISTS idx_products_offer_price
  ON products(offer_price)
  WHERE offer_price IS NOT NULL;
