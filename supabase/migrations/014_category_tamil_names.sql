-- ─────────────────────────────────────────────────────────────────────────────
-- 014_category_tamil_names.sql
--
-- Adds a `tamil_name` column to the categories table and populates
-- Tamil names for all 14 existing subcategories.
--
-- This mirrors the `products.tamil_name` column added in migration 004.
-- The column is used by the customer-facing Shop tabs and Home category tiles
-- to display bilingual labels (English + Tamil). Admin pages are unaffected.
--
-- HOW TO APPLY:
--   1. Go to https://supabase.com/dashboard → your KR Vegetables project
--   2. Click "SQL Editor"
--   3. Paste this file and click "Run"
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS tamil_name TEXT;

-- ── Vegetable subcategories ───────────────────────────────────────────────────
UPDATE categories SET tamil_name = 'கீரைகள்'                          WHERE name = 'Leafy Greens';
UPDATE categories SET tamil_name = 'கிழங்கு வகைகள்'                   WHERE name = 'Root Vegetables';
UPDATE categories SET tamil_name = 'பூசணி வகைகள்'                    WHERE name = 'Gourds & Pumpkin';
UPDATE categories SET tamil_name = 'தக்காளி மற்றும் மிளகாய்'          WHERE name = 'Tomatoes & Peppers';
UPDATE categories SET tamil_name = 'பருப்பு வகைகள்'                   WHERE name = 'Beans & Lentils';
UPDATE categories SET tamil_name = 'முட்டைகோஸ் வகைகள்'               WHERE name = 'Cabbage & Cauliflower';
UPDATE categories SET tamil_name = 'பிற காய்கறிகள்'                   WHERE name = 'Other Vegetables';
UPDATE categories SET tamil_name = 'மூலிகைகள் மற்றும் வாசனை வகைகள்'  WHERE name = 'Herbs & Spices';

-- ── Fruit subcategories ───────────────────────────────────────────────────────
UPDATE categories SET tamil_name = 'வெப்பமண்டல பழங்கள்'              WHERE name = 'Tropical Fruits';
UPDATE categories SET tamil_name = 'சிட்ரஸ் பழங்கள்'                 WHERE name = 'Citrus Fruits';
UPDATE categories SET tamil_name = 'பீச் மற்றும் பிளம்'               WHERE name = 'Peach & Plum';
UPDATE categories SET tamil_name = 'பெர்ரி மற்றும் திராட்சை'          WHERE name = 'Berries & Grapes';
UPDATE categories SET tamil_name = 'அன்றாட பழங்கள்'                  WHERE name = 'Everyday Fruits';
UPDATE categories SET tamil_name = 'சிறப்பு மற்றும் பருவகால'          WHERE name = 'Special & Seasonal';
