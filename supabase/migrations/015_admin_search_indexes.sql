-- ─────────────────────────────────────────────────────────────────────────────
-- 015_admin_search_indexes.sql
--
-- Adds indexes required for the admin order search and filtering feature.
-- Without these, searching by customer name/phone or filtering by city/pincode
-- results in sequential table scans — fine at 1K rows, slow at 10K+.
--
-- HOW TO APPLY:
--   1. Go to https://supabase.com/dashboard → your KR Vegetables project
--   2. Click "SQL Editor" → paste this file → "Run"
-- ─────────────────────────────────────────────────────────────────────────────

-- customers.phone — used for phone-based order lookup in admin search
-- (UNIQUE already creates an index, but we add one explicitly to confirm)
CREATE INDEX IF NOT EXISTS idx_customers_phone
  ON customers(phone);

-- customers.full_name — used for name-based order search (ilike '%name%')
CREATE INDEX IF NOT EXISTS idx_customers_full_name
  ON customers(full_name);

-- orders.payment_method — used for COD/Online payment filter
CREATE INDEX IF NOT EXISTS idx_orders_payment_method
  ON orders(payment_method);

-- orders.delivery_slot — used for morning/afternoon slot filter
CREATE INDEX IF NOT EXISTS idx_orders_delivery_slot
  ON orders(delivery_slot);

-- addresses.city — used for area/city filtering
CREATE INDEX IF NOT EXISTS idx_addresses_city
  ON addresses(city);

-- addresses.pincode — used for pincode filtering
CREATE INDEX IF NOT EXISTS idx_addresses_pincode
  ON addresses(pincode);

-- Composite index for the most common admin query:
-- all recent orders regardless of status (order list default view)
CREATE INDEX IF NOT EXISTS idx_orders_placed_at_status
  ON orders(placed_at DESC, status);
