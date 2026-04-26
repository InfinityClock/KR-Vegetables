-- ─────────────────────────────────────────────────────────────────────────────
-- 003_fix_guest_customers.sql
--
-- PROBLEM 1: customers.id has a FK → auth.users(id), preventing guest checkout.
--   The create-order API creates customers by phone without requiring auth,
--   but the FK blocks any insert where id is not an existing auth user UUID.
--
-- PROBLEM 2: customers.phone has no UNIQUE constraint, so the upsert in
--   create-order.js (?on_conflict=phone) fails silently and creates duplicates.
--
-- HOW TO APPLY:
--   1. Go to https://supabase.com/dashboard → your KR Vegetables project
--   2. Click "SQL Editor" in the left sidebar
--   3. Paste this entire file and click "Run"
--   4. You should see "Success. No rows returned."
-- ─────────────────────────────────────────────────────────────────────────────

-- Step 1: Give customers.id a default so new rows auto-generate their own UUID
ALTER TABLE customers ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Step 2: Drop the FK to auth.users so guest (unauthenticated) customers are allowed
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_id_fkey;

-- Step 3: Add UNIQUE on phone so the on_conflict=phone upsert works correctly
ALTER TABLE customers ADD CONSTRAINT customers_phone_unique UNIQUE (phone);
