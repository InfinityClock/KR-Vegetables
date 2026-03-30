-- ─────────────────────────────────────────────────────────────────────────────
-- 002_fix_admin_rls.sql
--
-- PROBLEM: The original RLS admin policies used:
--   auth.jwt() ->> 'role' = 'admin'
-- This checks the Supabase SYSTEM role in the JWT root, which is always
-- 'authenticated' or 'anon' — never 'admin'. Custom roles are stored under
-- app_metadata or user_metadata, not at the root level.
--
-- FIX: Create an is_admin() helper function that checks both the correct JWT
-- paths AND a hardcoded admin email as a reliable fallback.
--
-- HOW TO APPLY (takes ~30 seconds):
--   1. Go to https://supabase.com/dashboard
--   2. Select your KR Vegetables project
--   3. Click "SQL Editor" in the left sidebar
--   4. Paste this ENTIRE file into the editor
--   5. Click the green "Run" button
--   6. You should see "Success. No rows returned."
--   7. Reload your admin panel — items will now be visible
-- ─────────────────────────────────────────────────────────────────────────────

-- Step 1: Create a reusable admin-check helper function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT (
    -- Check app_metadata.role (set via Supabase dashboard or admin API)
    ((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin'
    OR
    -- Check user_metadata.role (set during signup or profile update)
    ((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin'
    OR
    -- Fallback: allow by email (most reliable for single-admin apps)
    (auth.jwt() ->> 'email') = 'krajesh@gmail.com'
  );
$$;

-- Step 2: Drop old broken admin policies
DROP POLICY IF EXISTS "categories_admin_all"  ON categories;
DROP POLICY IF EXISTS "products_admin_all"    ON products;
DROP POLICY IF EXISTS "customers_admin_all"   ON customers;
DROP POLICY IF EXISTS "addresses_admin_all"   ON addresses;
DROP POLICY IF EXISTS "orders_admin_all"      ON orders;
DROP POLICY IF EXISTS "order_items_admin"     ON order_items;
DROP POLICY IF EXISTS "tracking_admin"        ON order_tracking;
DROP POLICY IF EXISTS "banners_admin_all"     ON offers_banner;
DROP POLICY IF EXISTS "settings_admin_all"    ON store_settings;

-- Step 3: Recreate admin policies using the correct is_admin() function
CREATE POLICY "categories_admin_all"  ON categories     FOR ALL USING (is_admin());
CREATE POLICY "products_admin_all"    ON products       FOR ALL USING (is_admin());
CREATE POLICY "customers_admin_all"   ON customers      FOR ALL USING (is_admin());
CREATE POLICY "addresses_admin_all"   ON addresses      FOR ALL USING (is_admin());
CREATE POLICY "orders_admin_all"      ON orders         FOR ALL USING (is_admin());
CREATE POLICY "order_items_admin"     ON order_items    FOR ALL USING (is_admin());
CREATE POLICY "tracking_admin"        ON order_tracking FOR ALL USING (is_admin());
CREATE POLICY "banners_admin_all"     ON offers_banner  FOR ALL USING (is_admin());
CREATE POLICY "settings_admin_all"    ON store_settings FOR ALL USING (is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- PERMANENTLY MARK YOUR ADMIN ACCOUNT (Recommended — run this too)
-- This sets app_metadata so the admin role survives even if email changes.
-- Replace the email below with your admin email if different.
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
  WHERE email = 'krajesh@gmail.com';
