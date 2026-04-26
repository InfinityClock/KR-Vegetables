-- Add tamil_name column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS tamil_name TEXT;

-- ── Leafy Greens ──────────────────────────────────────────────
UPDATE products SET tamil_name = 'பாலக் கீரை'       WHERE name = 'Spinach (Palak)';
UPDATE products SET tamil_name = 'வெந்தயக் கீரை'    WHERE name = 'Methi (Fenugreek)';
UPDATE products SET tamil_name = 'கொத்தமல்லி'       WHERE name = 'Coriander (Dhania)';
UPDATE products SET tamil_name = 'கறிவேப்பிலை'      WHERE name = 'Curry Leaves';
UPDATE products SET tamil_name = 'முளைக்கீரை'       WHERE name = 'Amaranth (Thotakura)';
UPDATE products SET tamil_name = 'முருங்கைக் கீரை'  WHERE name = 'Drumstick Leaves';
UPDATE products SET tamil_name = 'லெட்டூஸ்'         WHERE name = 'Lettuce';
UPDATE products SET tamil_name = 'முட்டைகோஸ்'       WHERE name = 'Cabbage';

-- ── Root Vegetables ───────────────────────────────────────────
UPDATE products SET tamil_name = 'கேரட்'                    WHERE name = 'Carrot';
UPDATE products SET tamil_name = 'பீட்ரூட்'                 WHERE name = 'Beetroot';
UPDATE products SET tamil_name = 'முள்ளங்கி'                WHERE name = 'Radish (Mooli)';
UPDATE products SET tamil_name = 'டர்னிப்'                  WHERE name = 'Turnip';
UPDATE products SET tamil_name = 'சர்க்கரைவள்ளிக்கிழங்கு' WHERE name = 'Sweet Potato';
UPDATE products SET tamil_name = 'உருளைக்கிழங்கு'          WHERE name = 'Potato';
UPDATE products SET tamil_name = 'வெங்காயம்'                WHERE name = 'Onion';
UPDATE products SET tamil_name = 'பூண்டு'                   WHERE name = 'Garlic';
UPDATE products SET tamil_name = 'இஞ்சி'                    WHERE name = 'Ginger';
UPDATE products SET tamil_name = 'மஞ்சள் கிழங்கு'          WHERE name = 'Turmeric Root';

-- ── Gourds & Squash ───────────────────────────────────────────
UPDATE products SET tamil_name = 'சுரைக்காய்'   WHERE name = 'Bottle Gourd (Lauki)';
UPDATE products SET tamil_name = 'பாகற்காய்'    WHERE name = 'Bitter Gourd (Karela)';
UPDATE products SET tamil_name = 'பீர்க்கங்காய்' WHERE name = 'Ridge Gourd';
UPDATE products SET tamil_name = 'புடலங்காய்'   WHERE name = 'Snake Gourd';
UPDATE products SET tamil_name = 'சாம்பல் பூசணி' WHERE name = 'Ash Gourd';
UPDATE products SET tamil_name = 'பூசணிக்காய்'  WHERE name = 'Pumpkin';
UPDATE products SET tamil_name = 'சுக்கினி'     WHERE name = 'Zucchini';

-- ── Tomatoes & Peppers ────────────────────────────────────────
UPDATE products SET tamil_name = 'தக்காளி'              WHERE name = 'Tomato';
UPDATE products SET tamil_name = 'செர்ரி தக்காளி'       WHERE name = 'Cherry Tomato';
UPDATE products SET tamil_name = 'பச்சை மிளகாய்'        WHERE name = 'Green Chilli';
UPDATE products SET tamil_name = 'சிவப்பு மிளகாய்'      WHERE name = 'Red Chilli';
UPDATE products SET tamil_name = 'பச்சை குடை மிளகாய்'   WHERE name = 'Capsicum Green';
UPDATE products SET tamil_name = 'சிவப்பு குடை மிளகாய்' WHERE name = 'Capsicum Red';
UPDATE products SET tamil_name = 'மஞ்சள் குடை மிளகாய்'  WHERE name = 'Capsicum Yellow';

-- ── Beans & Pulses ────────────────────────────────────────────
UPDATE products SET tamil_name = 'பீன்ஸ்'         WHERE name = 'French Beans';
UPDATE products SET tamil_name = 'கொத்தவரங்காய்'  WHERE name = 'Cluster Beans (Guar)';
UPDATE products SET tamil_name = 'சேம்பு அவரை'   WHERE name = 'Broad Beans';
UPDATE products SET tamil_name = 'அவரைக்காய்'     WHERE name = 'Hyacinth Beans (Avarakkai)';
UPDATE products SET tamil_name = 'பட்டாணி'        WHERE name = 'Green Peas (Fresh)';
UPDATE products SET tamil_name = 'லீமா பீன்ஸ்'   WHERE name = 'Lima Beans';
UPDATE products SET tamil_name = 'தட்டைப்பயறு'   WHERE name = 'Cowpeas (Lobia)';

-- ── Cruciferous ───────────────────────────────────────────────
UPDATE products SET tamil_name = 'காலிஃப்ளவர்' WHERE name = 'Cauliflower';
UPDATE products SET tamil_name = 'ப்ரோக்கோலி'  WHERE name = 'Broccoli';
UPDATE products SET tamil_name = 'கோல்ராபி'    WHERE name = 'Kohlrabi';

-- ── Stems & Others ────────────────────────────────────────────
UPDATE products SET tamil_name = 'முருங்கைக்காய்'   WHERE name = 'Drumstick (Murungakkai)';
UPDATE products SET tamil_name = 'வாழைக்காய்'        WHERE name = 'Raw Banana';
UPDATE products SET tamil_name = 'சேனைக்கிழங்கு'    WHERE name = 'Yam (Senai)';
UPDATE products SET tamil_name = 'சேப்பங்கிழங்கு'   WHERE name = 'Colocasia (Arbi)';
UPDATE products SET tamil_name = 'தாமரை தண்டு'      WHERE name = 'Lotus Stem';
UPDATE products SET tamil_name = 'இனிப்பு சோளம்'    WHERE name = 'Sweet Corn';
UPDATE products SET tamil_name = 'காளான்'             WHERE name = 'Mushroom (Button)';
UPDATE products SET tamil_name = 'வெண்டைக்காய்'      WHERE name = 'Lady''s Finger (Okra)';
UPDATE products SET tamil_name = 'கத்திரிக்காய்'     WHERE name = 'Eggplant (Brinjal)';
UPDATE products SET tamil_name = 'வெள்ளரிக்காய்'     WHERE name = 'Cucumber';

-- ── Herbs & Aromatics ─────────────────────────────────────────
UPDATE products SET tamil_name = 'புதினா'           WHERE name = 'Mint (Pudina)';
UPDATE products SET tamil_name = 'துளசி'            WHERE name = 'Basil';
UPDATE products SET tamil_name = 'எலுமிச்சைப்புல்' WHERE name = 'Lemongrass';
UPDATE products SET tamil_name = 'வெங்காய தாள்கள்' WHERE name = 'Green Onion (Spring Onion)';
UPDATE products SET tamil_name = 'செலரி'            WHERE name = 'Celery';
UPDATE products SET tamil_name = 'பார்ஸ்லி'        WHERE name = 'Parsley';
UPDATE products SET tamil_name = 'சோம்பு இலை'      WHERE name = 'Dill Leaves';

-- ── Tropical Fruits ───────────────────────────────────────────
UPDATE products SET tamil_name = 'வாழைப்பழம்'            WHERE name = 'Banana (Robusta)';
UPDATE products SET tamil_name = 'மாங்காய்'               WHERE name = 'Raw Mango';
UPDATE products SET tamil_name = 'ஆல்ஃபான்சோ மாம்பழம்'  WHERE name = 'Mango (Alphonso)';
UPDATE products SET tamil_name = 'பங்கனபள்ளி மாம்பழம்'  WHERE name = 'Mango (Banganapalli)';
UPDATE products SET tamil_name = 'பப்பாளி'                WHERE name = 'Papaya';
UPDATE products SET tamil_name = 'பலாப்பழம்'              WHERE name = 'Jackfruit';
UPDATE products SET tamil_name = 'தேங்காய்'               WHERE name = 'Coconut';
UPDATE products SET tamil_name = 'அன்னாசிப்பழம்'         WHERE name = 'Pineapple';
UPDATE products SET tamil_name = 'கொய்யாப்பழம்'          WHERE name = 'Guava';

-- ── Citrus Fruits ─────────────────────────────────────────────
UPDATE products SET tamil_name = 'எலுமிச்சை' WHERE name = 'Lemon';
UPDATE products SET tamil_name = 'நிம்பு'    WHERE name = 'Lime (Nimbu)';
UPDATE products SET tamil_name = 'ஆரஞ்சு'   WHERE name = 'Orange (Nagpur)';
UPDATE products SET tamil_name = 'மோசம்பி'  WHERE name = 'Sweet Lime (Mosambi)';
UPDATE products SET tamil_name = 'கிரேப்ஃப்ரூட்' WHERE name = 'Grapefruit';
UPDATE products SET tamil_name = 'மாண்டரின்' WHERE name = 'Mandarin';

-- ── Stone Fruits ──────────────────────────────────────────────
UPDATE products SET tamil_name = 'பீச்'    WHERE name = 'Peach';
UPDATE products SET tamil_name = 'பிளம்'   WHERE name = 'Plum';
UPDATE products SET tamil_name = 'லிச்சி'  WHERE name = 'Lychee';
UPDATE products SET tamil_name = 'லாங்கன்' WHERE name = 'Longan';

-- ── Berries & Grapes ──────────────────────────────────────────
UPDATE products SET tamil_name = 'பச்சை திராட்சை'  WHERE name = 'Green Grapes';
UPDATE products SET tamil_name = 'கருப்பு திராட்சை' WHERE name = 'Black Grapes';
UPDATE products SET tamil_name = 'சிவப்பு திராட்சை' WHERE name = 'Red Globe Grapes';
UPDATE products SET tamil_name = 'ஸ்ட்ராபெரி'      WHERE name = 'Strawberry';
UPDATE products SET tamil_name = 'ப்ளூபெரி'        WHERE name = 'Blueberry';
UPDATE products SET tamil_name = 'தர்பூசணி'        WHERE name = 'Watermelon';
UPDATE products SET tamil_name = 'முலாம்பழம்'      WHERE name = 'Muskmelon';

-- ── Everyday Fruits ───────────────────────────────────────────
UPDATE products SET tamil_name = 'ஆப்பிள்'       WHERE name = 'Apple (Shimla)';
UPDATE products SET tamil_name = 'காஷ்மீர் ஆப்பிள்' WHERE name = 'Apple (Kashmiri)';
UPDATE products SET tamil_name = 'பேரீக்காய்'    WHERE name = 'Pear';
UPDATE products SET tamil_name = 'மாதுளை'        WHERE name = 'Pomegranate';
UPDATE products SET tamil_name = 'அத்திப்பழம்'   WHERE name = 'Fig (Anjeer)';
UPDATE products SET tamil_name = 'சப்போட்டா'     WHERE name = 'Sapota (Chikoo)';
UPDATE products SET tamil_name = 'சீதாப்பழம்'    WHERE name = 'Custard Apple (Sitaphal)';

-- ── Exotic & Seasonal ─────────────────────────────────────────
UPDATE products SET tamil_name = 'டிராகன் பழம்'      WHERE name = 'Dragon Fruit';
UPDATE products SET tamil_name = 'கிவி'              WHERE name = 'Kiwi';
UPDATE products SET tamil_name = 'வெண்ணெய் பழம்'    WHERE name = 'Avocado';
UPDATE products SET tamil_name = 'பேஷன் பழம்'       WHERE name = 'Passion Fruit';
UPDATE products SET tamil_name = 'நட்சத்திரப் பழம்' WHERE name = 'Star Fruit (Kamrakh)';
UPDATE products SET tamil_name = 'ராம்புட்டன்'      WHERE name = 'Rambutan';
