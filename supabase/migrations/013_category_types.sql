-- ─────────────────────────────────────────────────────────────────────────────
-- 013_category_types.sql
--
-- Adds a `type` column to the categories table so the customer-facing Shop
-- and Home pages can show simplified "Vegetables / Fruits" tabs instead of
-- all 14 subcategories. Admin pages are unaffected and continue to use
-- the full subcategory detail.
--
-- HOW TO APPLY:
--   1. Go to https://supabase.com/dashboard → your KR Vegetables project
--   2. Click "SQL Editor"
--   3. Paste this file and click "Run"
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'vegetable'
  CHECK (type IN ('vegetable', 'fruit'));

-- ── Vegetable categories ──────────────────────────────────────────────────────
UPDATE categories SET type = 'vegetable' WHERE name IN (
  'Leafy Greens',
  'Root Vegetables',
  'Gourds & Pumpkin',
  'Tomatoes & Peppers',
  'Beans & Lentils',
  'Cabbage & Cauliflower',
  'Other Vegetables',
  'Herbs & Spices'
);

-- ── Fruit categories ──────────────────────────────────────────────────────────
UPDATE categories SET type = 'fruit' WHERE name IN (
  'Tropical Fruits',
  'Citrus Fruits',
  'Peach & Plum',
  'Berries & Grapes',
  'Everyday Fruits',
  'Special & Seasonal'
);

-- Index for fast type-based filtering
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
