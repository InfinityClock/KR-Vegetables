/**
 * Tamil translations — KR Vegetables & Fruits
 *
 * All customer-facing bilingual strings are maintained here.
 * Structure: flat keys matching English constants for easy lookup.
 *
 * To add a new language:
 *   1. Create src/i18n/kannada.js (same structure)
 *   2. Import it in src/i18n/index.js
 *   3. Add the locale key to LOCALES
 */

export const ta = {
  // ── Primary category tabs (Shop page + Home tiles) ─────────────────────────
  category: {
    all:       'அனைத்தும்',
    vegetable: 'காய்கறிகள்',
    fruit:     'பழங்கள்',
    offers:    'சலுகைகள்',
    fresh:     'புதியவை',
  },

  // ── Category tile descriptions (Home QuickCategories) ──────────────────────
  categoryDesc: {
    vegetable: 'கீரை, காய்கறி, கிழங்கு',
    fruit:     'வெப்பமண்டல, சிட்ரஸ், பருவகால',
    offers:    'இன்றைய சலுகை விலைகள்',
    all:       'முழு தயாரிப்பு பட்டியல்',
  },

  // ── Subcategory names (from DB, used when admin adds new categories) ────────
  subcategory: {
    'Leafy Greens':         'கீரைகள்',
    'Root Vegetables':      'கிழங்கு வகைகள்',
    'Gourds & Pumpkin':     'பூசணி வகைகள்',
    'Tomatoes & Peppers':   'தக்காளி மற்றும் மிளகாய்',
    'Beans & Lentils':      'பருப்பு வகைகள்',
    'Cabbage & Cauliflower':'முட்டைகோஸ் வகைகள்',
    'Other Vegetables':     'பிற காய்கறிகள்',
    'Herbs & Spices':       'மூலிகைகள் மற்றும் வாசனை வகைகள்',
    'Tropical Fruits':      'வெப்பமண்டல பழங்கள்',
    'Citrus Fruits':        'சிட்ரஸ் பழங்கள்',
    'Peach & Plum':         'பீச் மற்றும் பிளம்',
    'Berries & Grapes':     'பெர்ரி மற்றும் திராட்சை',
    'Everyday Fruits':      'அன்றாட பழங்கள்',
    'Special & Seasonal':   'சிறப்பு மற்றும் பருவகால',
  },

  // ── Order status (Order Tracking page) ────────────────────────────────────
  orderStatus: {
    placed:           'ஆர்டர் பதிவு',
    confirmed:        'உறுதி செய்யப்பட்டது',
    packing:          'பேக்கிங் நடக்கிறது',
    out_for_delivery: 'டெலிவரி வருகிறது',
    delivered:        'டெலிவரி ஆனது',
    cancelled:        'ரத்து செய்யப்பட்டது',
  },

  // ── Delivery & checkout ────────────────────────────────────────────────────
  delivery: {
    free:         'இலவச டெலிவரி',
    slot_morning: 'காலை 8 – பகல் 1',
    slot_evening: 'மதியம் 3 – இரவு 8',
    farm_fresh:   'தினமும் புதியவை',
    guaranteed:   'தரம் உறுதி',
  },

  // ── Common UI labels ───────────────────────────────────────────────────────
  ui: {
    add_to_cart:  'கூடையில் சேர்',
    view_cart:    'கூடை பார்க்க',
    checkout:     'ஆர்டர் செய்ய',
    out_of_stock: 'கையிருப்பில் இல்லை',
    few_left:     'குறைவாக உள்ளது',
    no_orders:    'ஆர்டர்கள் இல்லை',
    fresh_today:  'இன்று புதியவை',
  },
}
