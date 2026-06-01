-- ─────────────────────────────────────────────────────────────────────────────
-- 010_restrict_settings_public_read.sql
--
-- PROBLEM: The original settings_public_read policy does FOR SELECT USING(TRUE),
--   exposing ALL keys to any anonymous caller — including upi_id and any future
--   sensitive keys an admin might store.
--
-- FIX: Replace the blanket public read with an explicit allowlist of keys that
--   are legitimately needed by the customer-facing frontend:
--
--     store_open            — used to show/hide the "store closed" banner
--     handling_charge_rate  — used to calculate the cart total
--     store_name            — displayed in the store footer
--     store_address         — displayed on the contact and footer pages
--
--   All other keys (upi_id, whatsapp_number, etc.) remain readable only by
--   authenticated admins via the is_admin() policy.
--
-- HOW TO APPLY:
--   1. Go to https://supabase.com/dashboard → your KR Vegetables project
--   2. Click "SQL Editor" in the left sidebar
--   3. Paste this file and click "Run"
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop the existing blanket public-read policy
DROP POLICY IF EXISTS "settings_public_read" ON store_settings;

-- Replace with an allowlist of safe-to-expose keys only
CREATE POLICY "settings_public_read" ON store_settings
  FOR SELECT
  USING (
    key IN (
      'store_open',
      'handling_charge_rate',
      'store_name',
      'store_address'
    )
  );
