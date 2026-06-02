-- ─────────────────────────────────────────────────────────────────────────────
-- 012_reset_sort_order.sql
--
-- PROBLEM: products.sort_order column has existed since migration 001 but all
--   rows have sort_order = 0 (the default). This means ordering by sort_order
--   is meaningless — all products tie and fall back to created_at order.
--
-- FIX: Assign each product a unique sort_order based on its current
--   created_at position (newest = lowest number = appears first, matching
--   the existing default ordering). This means the first deploy of the
--   drag-to-reorder feature causes zero visible reordering for customers.
--
-- HOW TO APPLY:
--   1. Go to https://supabase.com/dashboard → your KR Vegetables project
--   2. Click "SQL Editor"
--   3. Paste this file and click "Run"
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE products
SET sort_order = sub.rn
FROM (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
  FROM products
) sub
WHERE products.id = sub.id;

-- Index for fast ORDER BY sort_order queries
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order ASC);
