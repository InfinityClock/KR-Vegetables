-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 019 — Product Catalog Audit Fixes
--
-- Fixes identified in full product catalog audit (June 2026):
--
--  A. IMAGE FIXES  — 32 products had duplicate or mismatched images.
--     Setting image_url = NULL lets the client-side smart resolver
--     (ProductCard.jsx FOOD_IMAGES) supply the correct image per product name.
--
--  B. CATEGORY FIXES — 4 products were in logically wrong categories.
--
--  C. PRICING FIX — Carrot had offer_price = price (not a real discount).
--
--  D. TAMIL TRANSLATION FIXES — 4 incorrect/inappropriate translations.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── A. IMAGE FIXES ────────────────────────────────────────────────────────────
-- Clear image_url for products whose stored image is wrong/duplicated.
-- The smart resolver in ProductCard.jsx will supply the correct image.

UPDATE products SET image_url = NULL WHERE name IN (
  -- Was showing potato image
  'Colocasia (Arbi)',
  -- Was sharing spinach image
  'Amaranth (Thotakura)',
  'Methi (Fenugreek)',
  'Drumstick Leaves',
  -- Was sharing coriander image
  'Dill Leaves',
  'Parsley',
  -- Was sharing herb/mint image
  'Mint (Pudina)',
  'Basil',
  'Lemongrass',
  'Celery',
  -- Was sharing bitter gourd image
  'Eggplant (Brinjal)',
  -- Was sharing brinjal image (wrong product)
  'Bitter Gourd (Karela)',
  -- Was sharing ridge gourd image
  'Snake Gourd',
  -- Was sharing pumpkin image
  'Ash Gourd',
  -- Was sharing radish image
  'Turnip',
  -- Was sharing cauliflower image
  'Kohlrabi',
  -- Was sharing cucumber image
  'Lotus Stem',
  -- Was sharing sweet potato image
  'Yam (Senai)',
  -- Was sharing ginger image
  'Turmeric Root',
  -- Was sharing muskmelon/papaya image
  'Sapota (Chikoo)',
  'Papaya',
  -- Was showing pineapple image
  'Star Fruit (Kamrakh)',
  -- Was showing apple image
  'Custard Apple (Sitaphal)',
  -- Was showing grapes image
  'Lychee',
  -- Was showing mango image
  'Longan',
  -- Was showing dragon fruit image
  'Passion Fruit',
  -- Was showing guava image
  'Rambutan',
  -- Was sharing pomegranate image
  'Fig (Anjeer)',
  -- Was sharing pomegranate image
  'Pomegranate',
  -- Was sharing same peas image
  'Lima Beans',
  'Cowpeas (Lobia)',
  -- Was sharing generic beans image
  'Broad Beans',
  'Hyacinth Beans (Avarakkai)',
  'Cluster Beans (Guar)',
  'French Beans',
  -- All three oranges sharing same image — grapefruit looks different
  'Grapefruit',
  -- Watermelon / Muskmelon — will get correct resolver images
  'Watermelon',
  'Muskmelon'
);

-- ── B. CATEGORY FIXES ─────────────────────────────────────────────────────────

-- Muskmelon: was in "Berries & Grapes" (cat 12) → move to "Tropical Fruits" (cat 9)
UPDATE products
SET category_id = 'c1000000-0000-0000-0000-000000000009'
WHERE name = 'Muskmelon';

-- Watermelon: was in "Berries & Grapes" (cat 12) → move to "Tropical Fruits" (cat 9)
UPDATE products
SET category_id = 'c1000000-0000-0000-0000-000000000009'
WHERE name = 'Watermelon';

-- Longan: was in "Peach & Plum" (cat 11) → move to "Special & Seasonal" (cat 14)
UPDATE products
SET category_id = 'c1000000-0000-0000-0000-000000000014'
WHERE name = 'Longan';

-- Lychee: was in "Peach & Plum" (cat 11) → move to "Special & Seasonal" (cat 14)
UPDATE products
SET category_id = 'c1000000-0000-0000-0000-000000000014'
WHERE name = 'Lychee';

-- ── C. PRICING FIX ────────────────────────────────────────────────────────────

-- Carrot: offer_price was equal to price (₹90 = ₹90) — not a real discount.
-- Remove the fake offer so the badge does not show "0% off".
UPDATE products
SET offer_price = NULL
WHERE name = 'Carrot'
  AND offer_price IS NOT NULL
  AND offer_price >= price;

-- ── D. TAMIL TRANSLATION FIXES ───────────────────────────────────────────────

-- Lime (Nimbu): "நிம்பு" is Hindi (Nimbu) — the Tamil term is சின்ன எலுமிச்சை
UPDATE products SET tamil_name = 'சின்ன எலுமிச்சை' WHERE name = 'Lime (Nimbu)';

-- Cowpeas (Lobia): "தட்டைப்பயறு" is flat beans — Cowpeas in Tamil is காராமணி
UPDATE products SET tamil_name = 'காராமணி' WHERE name = 'Cowpeas (Lobia)';

-- Amaranth (Thotakura): "முளைக்கீரை" means sprouted greens — Amaranth = அரைக்கீரை
UPDATE products SET tamil_name = 'அரைக்கீரை' WHERE name = 'Amaranth (Thotakura)';

-- Broad Beans: "சேம்பு அவரை" is wrong — சேம்பு means Colocasia/Taro.
-- Broad beans in Tamil is பட்டைப்பயறு
UPDATE products SET tamil_name = 'பட்டைப்பயறு' WHERE name = 'Broad Beans';
