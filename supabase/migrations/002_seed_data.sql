-- ─────────────────────────────────────────
-- STORE SETTINGS SEED
-- ─────────────────────────────────────────
INSERT INTO store_settings (key, value) VALUES
  ('delivery_fee', '40'),
  ('min_order_amount', '150'),
  ('store_open', 'true'),
  ('delivery_slots', '["Morning 7AM–10AM","Afternoon 12PM–3PM","Evening 5PM–8PM"]'),
  ('whatsapp_number', '+919876543210'),
  ('store_address', 'KR Vegetables & Fruits, Local Market, Bengaluru - 560001'),
  ('upi_id', 'krvegetables@upi'),
  ('store_name', 'KR Vegetables & Fruits');

-- ─────────────────────────────────────────
-- OFFERS BANNER SEED
-- ─────────────────────────────────────────
INSERT INTO offers_banner (title, subtitle, bg_color, is_active) VALUES
  ('Today''s Fresh Picks 🌿', 'Farm-fresh vegetables delivered daily', '#2D6A4F', TRUE),
  ('Seasonal Offers 🥭', 'Up to 30% off on seasonal fruits', '#F4A261', TRUE),
  ('Free Delivery 🚚', 'On orders above ₹300 this week!', '#52B788', TRUE);

-- ─────────────────────────────────────────
-- CATEGORIES SEED
-- ─────────────────────────────────────────
INSERT INTO categories (id, name, emoji, display_order, is_active) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Leafy Greens', '🥬', 1, TRUE),
  ('c1000000-0000-0000-0000-000000000002', 'Root Vegetables', '🥕', 2, TRUE),
  ('c1000000-0000-0000-0000-000000000003', 'Gourds & Squash', '🥒', 3, TRUE),
  ('c1000000-0000-0000-0000-000000000004', 'Tomatoes & Peppers', '🍅', 4, TRUE),
  ('c1000000-0000-0000-0000-000000000005', 'Beans & Pulses', '🫘', 5, TRUE),
  ('c1000000-0000-0000-0000-000000000006', 'Cruciferous', '🥦', 6, TRUE),
  ('c1000000-0000-0000-0000-000000000007', 'Stems & Others', '🌿', 7, TRUE),
  ('c1000000-0000-0000-0000-000000000008', 'Herbs & Aromatics', '🌱', 8, TRUE),
  ('c1000000-0000-0000-0000-000000000009', 'Tropical Fruits', '🍌', 9, TRUE),
  ('c1000000-0000-0000-0000-000000000010', 'Citrus Fruits', '🍋', 10, TRUE),
  ('c1000000-0000-0000-0000-000000000011', 'Stone Fruits', '🍑', 11, TRUE),
  ('c1000000-0000-0000-0000-000000000012', 'Berries & Grapes', '🍇', 12, TRUE),
  ('c1000000-0000-0000-0000-000000000013', 'Everyday Fruits', '🍎', 13, TRUE),
  ('c1000000-0000-0000-0000-000000000014', 'Exotic & Seasonal', '🥭', 14, TRUE);

-- ─────────────────────────────────────────
-- PRODUCTS SEED — LEAFY GREENS
-- ─────────────────────────────────────────
INSERT INTO products (category_id, name, description, unit, price, offer_price, offer_label, stock_status, is_featured, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Spinach (Palak)', 'Fresh, tender spinach leaves. Rich in iron and vitamins. Perfect for dals, sabzi, and smoothies.', 'bunch', 20, NULL, NULL, 'in_stock', TRUE, 1),
  ('c1000000-0000-0000-0000-000000000001', 'Methi (Fenugreek)', 'Fresh fenugreek leaves with a slightly bitter, aromatic taste. Great for parathas and sabzi.', 'bunch', 15, NULL, NULL, 'in_stock', FALSE, 2),
  ('c1000000-0000-0000-0000-000000000001', 'Coriander (Dhania)', 'Fresh coriander bunches, perfect for garnishing and chutneys. A kitchen essential.', 'bunch', 10, NULL, NULL, 'in_stock', TRUE, 3),
  ('c1000000-0000-0000-0000-000000000001', 'Curry Leaves', 'Fresh curry leaves, highly aromatic. Essential for South Indian cooking.', 'bunch', 10, NULL, NULL, 'in_stock', FALSE, 4),
  ('c1000000-0000-0000-0000-000000000001', 'Amaranth (Thotakura)', 'Fresh amaranth leaves, nutritious and tasty. Popular in South Indian cuisine.', 'bunch', 15, NULL, NULL, 'in_stock', FALSE, 5),
  ('c1000000-0000-0000-0000-000000000001', 'Drumstick Leaves', 'Highly nutritious moringa leaves. Rich in protein and minerals.', 'bunch', 20, NULL, NULL, 'in_stock', FALSE, 6),
  ('c1000000-0000-0000-0000-000000000001', 'Lettuce', 'Crisp, fresh lettuce leaves. Ideal for salads and sandwiches.', 'piece', 40, 35, '12% OFF', 'in_stock', FALSE, 7),
  ('c1000000-0000-0000-0000-000000000001', 'Cabbage', 'Fresh, firm cabbage head. Versatile vegetable for curries, stir-fries, and salads.', 'piece', 30, NULL, NULL, 'in_stock', FALSE, 8);

-- ─────────────────────────────────────────
-- ROOT VEGETABLES
-- ─────────────────────────────────────────
INSERT INTO products (category_id, name, description, unit, price, offer_price, offer_label, stock_status, is_featured, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000002', 'Carrot', 'Fresh orange carrots, sweet and crunchy. Great for snacking, salads, and cooking.', 'kg', 50, 45, '10% OFF', 'in_stock', TRUE, 1),
  ('c1000000-0000-0000-0000-000000000002', 'Beetroot', 'Deep red beetroots, earthy and sweet. Excellent for salads, juices, and halwa.', 'kg', 40, NULL, NULL, 'in_stock', FALSE, 2),
  ('c1000000-0000-0000-0000-000000000002', 'Radish (Mooli)', 'Fresh white radish, crisp and peppery. Used in salads, pickles, and parathas.', 'piece', 15, NULL, NULL, 'in_stock', FALSE, 3),
  ('c1000000-0000-0000-0000-000000000002', 'Turnip', 'Fresh purple-white turnips. Mild, slightly sweet flavor. Good for soups and stews.', 'kg', 40, NULL, NULL, 'limited', FALSE, 4),
  ('c1000000-0000-0000-0000-000000000002', 'Sweet Potato', 'Naturally sweet orange-fleshed sweet potatoes. Nutritious and filling.', 'kg', 45, NULL, NULL, 'in_stock', FALSE, 5),
  ('c1000000-0000-0000-0000-000000000002', 'Potato', 'Farm-fresh potatoes, a kitchen staple. Perfect for every dish!', 'kg', 35, NULL, NULL, 'in_stock', TRUE, 6),
  ('c1000000-0000-0000-0000-000000000002', 'Onion', 'Fresh red onions, essential in Indian cooking. Available in quantity.', 'kg', 40, 35, 'Deal', 'in_stock', TRUE, 7),
  ('c1000000-0000-0000-0000-000000000002', 'Garlic', 'Fresh garlic bulbs, pungent and flavorful. A must-have in every kitchen.', '250g', 30, NULL, NULL, 'in_stock', FALSE, 8),
  ('c1000000-0000-0000-0000-000000000002', 'Ginger', 'Fresh ginger root, spicy and aromatic. Essential for teas, curries, and marinades.', '250g', 25, NULL, NULL, 'in_stock', FALSE, 9),
  ('c1000000-0000-0000-0000-000000000002', 'Turmeric Root', 'Fresh turmeric rhizomes, vibrant yellow. Rich in curcumin and healing properties.', '250g', 35, NULL, NULL, 'limited', FALSE, 10);

-- ─────────────────────────────────────────
-- GOURDS & SQUASH
-- ─────────────────────────────────────────
INSERT INTO products (category_id, name, description, unit, price, offer_price, offer_label, stock_status, is_featured, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000003', 'Bottle Gourd (Lauki)', 'Fresh bottle gourd, light and nutritious. Perfect for dal, sabzi, and halwa.', 'piece', 30, NULL, NULL, 'in_stock', FALSE, 1),
  ('c1000000-0000-0000-0000-000000000003', 'Bitter Gourd (Karela)', 'Fresh bitter gourd with distinct bitter taste. Excellent for blood sugar management.', 'kg', 60, NULL, NULL, 'in_stock', FALSE, 2),
  ('c1000000-0000-0000-0000-000000000003', 'Ridge Gourd', 'Tender ridge gourd, mild flavor. Excellent in sambar, dal, and stir-fries.', 'piece', 20, NULL, NULL, 'in_stock', FALSE, 3),
  ('c1000000-0000-0000-0000-000000000003', 'Snake Gourd', 'Long, slender snake gourd. Popular in South Indian cooking.', 'piece', 25, NULL, NULL, 'in_stock', FALSE, 4),
  ('c1000000-0000-0000-0000-000000000003', 'Ash Gourd', 'Large ash gourd (white pumpkin). Used for juices, curries, and sweets.', 'piece', 40, NULL, NULL, 'in_stock', FALSE, 5),
  ('c1000000-0000-0000-0000-000000000003', 'Pumpkin', 'Fresh orange pumpkin, sweet and nutritious. Great for curries, soups, and sweets.', 'kg', 30, NULL, NULL, 'in_stock', FALSE, 6),
  ('c1000000-0000-0000-0000-000000000003', 'Zucchini', 'Fresh green zucchini. Light, versatile vegetable for grilling, sautéing, and baking.', 'piece', 35, 30, '14% OFF', 'limited', FALSE, 7);

-- ─────────────────────────────────────────
-- TOMATOES & PEPPERS
-- ─────────────────────────────────────────
INSERT INTO products (category_id, name, description, unit, price, offer_price, offer_label, stock_status, is_featured, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000004', 'Tomato', 'Ripe, juicy red tomatoes. Essential for curries, chutneys, and salads.', 'kg', 40, NULL, NULL, 'in_stock', TRUE, 1),
  ('c1000000-0000-0000-0000-000000000004', 'Cherry Tomato', 'Sweet, bite-sized cherry tomatoes. Perfect for salads and snacking.', '250g', 50, NULL, NULL, 'in_stock', FALSE, 2),
  ('c1000000-0000-0000-0000-000000000004', 'Green Chilli', 'Fresh hot green chillies. A must for spicy Indian cooking.', '100g', 15, NULL, NULL, 'in_stock', FALSE, 3),
  ('c1000000-0000-0000-0000-000000000004', 'Red Chilli', 'Fresh bright red chillies, fiery hot. Perfect for chutneys and pickles.', '100g', 20, NULL, NULL, 'in_stock', FALSE, 4),
  ('c1000000-0000-0000-0000-000000000004', 'Capsicum Green', 'Fresh green bell pepper, crunchy and mild. Great for stir-fries, stuffing, and salads.', 'piece', 25, NULL, NULL, 'in_stock', FALSE, 5),
  ('c1000000-0000-0000-0000-000000000004', 'Capsicum Red', 'Sweet red bell pepper, vibrant and flavorful. Higher in vitamin C.', 'piece', 40, NULL, NULL, 'in_stock', FALSE, 6),
  ('c1000000-0000-0000-0000-000000000004', 'Capsicum Yellow', 'Sunny yellow bell pepper, mild and sweet. Adds color and nutrition.', 'piece', 40, NULL, NULL, 'limited', FALSE, 7);

-- ─────────────────────────────────────────
-- BEANS & PULSES
-- ─────────────────────────────────────────
INSERT INTO products (category_id, name, description, unit, price, offer_price, offer_label, stock_status, is_featured, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000005', 'French Beans', 'Tender, slender French beans (haricot). Crisp texture, great for stir-fries and curries.', '500g', 40, NULL, NULL, 'in_stock', FALSE, 1),
  ('c1000000-0000-0000-0000-000000000005', 'Cluster Beans (Guar)', 'Fresh cluster beans, crunchy and nutritious. Classic South Indian sabzi.', '500g', 30, NULL, NULL, 'in_stock', FALSE, 2),
  ('c1000000-0000-0000-0000-000000000005', 'Broad Beans', 'Fresh broad beans (fava). Buttery flavor, great in curries and rice dishes.', '500g', 50, NULL, NULL, 'limited', FALSE, 3),
  ('c1000000-0000-0000-0000-000000000005', 'Hyacinth Beans (Avarakkai)', 'Fresh hyacinth beans, popular in Tamil Nadu cuisine. Delicious in sambar.', '500g', 35, NULL, NULL, 'in_stock', FALSE, 4),
  ('c1000000-0000-0000-0000-000000000005', 'Green Peas (Fresh)', 'Sweet, tender green peas. Season''s best! Perfect for pulao, curries, and snacks.', '500g', 60, 50, '16% OFF', 'in_stock', TRUE, 5),
  ('c1000000-0000-0000-0000-000000000005', 'Lima Beans', 'Creamy, buttery lima beans. Rich in protein and fiber.', '500g', 55, NULL, NULL, 'limited', FALSE, 6),
  ('c1000000-0000-0000-0000-000000000005', 'Cowpeas (Lobia)', 'Fresh green cowpeas, earthy and nutritious. Great for curries and salads.', '500g', 40, NULL, NULL, 'in_stock', FALSE, 7);

-- ─────────────────────────────────────────
-- CRUCIFEROUS
-- ─────────────────────────────────────────
INSERT INTO products (category_id, name, description, unit, price, offer_price, offer_label, stock_status, is_featured, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000006', 'Cauliflower', 'Fresh white cauliflower head. Versatile vegetable for curries, rice, and roasting.', 'piece', 40, NULL, NULL, 'in_stock', TRUE, 1),
  ('c1000000-0000-0000-0000-000000000006', 'Broccoli', 'Fresh green broccoli florets. Nutrient powerhouse, great for stir-fries and soups.', 'piece', 60, 50, '16% OFF', 'in_stock', TRUE, 2),
  ('c1000000-0000-0000-0000-000000000006', 'Kohlrabi', 'Unique stem vegetable with mild, sweet flavor. Great raw or cooked.', 'piece', 35, NULL, NULL, 'limited', FALSE, 3);

-- ─────────────────────────────────────────
-- STEMS & OTHERS
-- ─────────────────────────────────────────
INSERT INTO products (category_id, name, description, unit, price, offer_price, offer_label, stock_status, is_featured, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000007', 'Drumstick (Murungakkai)', 'Fresh drumsticks, essential for sambar. Rich in nutrients and minerals.', 'piece', 10, NULL, NULL, 'in_stock', FALSE, 1),
  ('c1000000-0000-0000-0000-000000000007', 'Raw Banana', 'Raw green bananas (plantain). Perfect for chips, curries, and traditional dishes.', 'piece', 15, NULL, NULL, 'in_stock', FALSE, 2),
  ('c1000000-0000-0000-0000-000000000007', 'Yam (Senai)', 'Fresh elephant yam. Dense, starchy vegetable great for fry and curry.', 'kg', 60, NULL, NULL, 'in_stock', FALSE, 3),
  ('c1000000-0000-0000-0000-000000000007', 'Colocasia (Arbi)', 'Small taro root, creamy texture when cooked. Popular in Indian cuisine.', 'kg', 50, NULL, NULL, 'in_stock', FALSE, 4),
  ('c1000000-0000-0000-0000-000000000007', 'Lotus Stem', 'Unique lotus root with beautiful pattern. Crunchy and nutritious.', '250g', 60, NULL, NULL, 'limited', FALSE, 5),
  ('c1000000-0000-0000-0000-000000000007', 'Sweet Corn', 'Fresh sweet corn cobs. Juicy and sweet, great for boiling and roasting.', 'piece', 20, NULL, NULL, 'in_stock', TRUE, 6),
  ('c1000000-0000-0000-0000-000000000007', 'Mushroom (Button)', 'Fresh white button mushrooms. Earthy flavor, great for soups, stir-fries, and pizza.', '200g', 50, 40, '20% OFF', 'in_stock', TRUE, 7),
  ('c1000000-0000-0000-0000-000000000007', 'Lady''s Finger (Okra)', 'Fresh okra, tender and crisp. Classic Indian bhindi sabzi and sambar ingredient.', '500g', 35, NULL, NULL, 'in_stock', TRUE, 8),
  ('c1000000-0000-0000-0000-000000000007', 'Eggplant (Brinjal)', 'Fresh purple eggplant. Versatile vegetable for bharwa, bhaji, and curries.', 'piece', 20, NULL, NULL, 'in_stock', FALSE, 9),
  ('c1000000-0000-0000-0000-000000000007', 'Cucumber', 'Crisp, cool cucumber. Perfect for raita, salads, and fresh eating.', 'piece', 15, NULL, NULL, 'in_stock', FALSE, 10);

-- ─────────────────────────────────────────
-- HERBS & AROMATICS
-- ─────────────────────────────────────────
INSERT INTO products (category_id, name, description, unit, price, offer_price, offer_label, stock_status, is_featured, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000008', 'Mint (Pudina)', 'Fresh mint leaves, cool and refreshing. Essential for chutneys, biryanis, and drinks.', 'bunch', 10, NULL, NULL, 'in_stock', FALSE, 1),
  ('c1000000-0000-0000-0000-000000000008', 'Basil', 'Fresh sweet basil leaves, aromatic and flavorful. Perfect for pasta, pizza, and salads.', 'bunch', 20, NULL, NULL, 'in_stock', FALSE, 2),
  ('c1000000-0000-0000-0000-000000000008', 'Lemongrass', 'Fresh lemongrass stalks with bright citrus fragrance. For teas and Thai cuisine.', 'bunch', 25, NULL, NULL, 'limited', FALSE, 3),
  ('c1000000-0000-0000-0000-000000000008', 'Green Onion (Spring Onion)', 'Fresh spring onions with green stalks. Mild flavor, great for garnishing and salads.', 'bunch', 15, NULL, NULL, 'in_stock', FALSE, 4),
  ('c1000000-0000-0000-0000-000000000008', 'Celery', 'Crisp celery stalks. Excellent for soups, salads, and juicing.', 'bunch', 40, NULL, NULL, 'in_stock', FALSE, 5),
  ('c1000000-0000-0000-0000-000000000008', 'Parsley', 'Fresh flat-leaf parsley, aromatic and flavorful. For garnishing and cooking.', 'bunch', 25, NULL, NULL, 'limited', FALSE, 6),
  ('c1000000-0000-0000-0000-000000000008', 'Dill Leaves', 'Fragrant dill leaves (shepu/suva). Perfect for fish, pickles, and potato dishes.', 'bunch', 20, NULL, NULL, 'in_stock', FALSE, 7);

-- ─────────────────────────────────────────
-- TROPICAL FRUITS
-- ─────────────────────────────────────────
INSERT INTO products (category_id, name, description, unit, price, offer_price, offer_label, stock_status, is_featured, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000009', 'Banana (Robusta)', 'Ripe Robusta bananas, sweet and creamy. Rich in potassium and energy.', 'dozen', 60, NULL, NULL, 'in_stock', TRUE, 1),
  ('c1000000-0000-0000-0000-000000000009', 'Raw Mango', 'Sour raw mangoes. Perfect for pickles, chutneys, and raw mango juice.', 'kg', 80, NULL, NULL, 'limited', FALSE, 2),
  ('c1000000-0000-0000-0000-000000000009', 'Mango (Alphonso)', 'The king of mangoes! Sweet, aromatic Alphonso mangoes from Ratnagiri.', 'dozen', 400, 350, 'Season Deal', 'limited', TRUE, 3),
  ('c1000000-0000-0000-0000-000000000009', 'Mango (Banganapalli)', 'Large, sweet Banganapalli mangoes. Fibrous, juicy and delicious.', 'kg', 100, NULL, NULL, 'in_stock', FALSE, 4),
  ('c1000000-0000-0000-0000-000000000009', 'Papaya', 'Ripe, sweet papaya. Rich in digestive enzymes and vitamins.', 'piece', 60, 50, '16% OFF', 'in_stock', FALSE, 5),
  ('c1000000-0000-0000-0000-000000000009', 'Jackfruit', 'Fresh jackfruit (ripe). Sweet, fibrous tropical fruit. Seasonal speciality.', 'piece', 120, NULL, NULL, 'limited', FALSE, 6),
  ('c1000000-0000-0000-0000-000000000009', 'Coconut', 'Fresh tender coconuts. Naturally hydrating with sweet coconut water.', 'piece', 40, NULL, NULL, 'in_stock', FALSE, 7),
  ('c1000000-0000-0000-0000-000000000009', 'Pineapple', 'Fresh, sweet pineapple. Tangy and tropical. Great for juices and desserts.', 'piece', 60, NULL, NULL, 'in_stock', FALSE, 8),
  ('c1000000-0000-0000-0000-000000000009', 'Guava', 'Fresh guavas, pink or white flesh. Rich in vitamin C and fiber.', 'kg', 60, NULL, NULL, 'in_stock', FALSE, 9);

-- ─────────────────────────────────────────
-- CITRUS FRUITS
-- ─────────────────────────────────────────
INSERT INTO products (category_id, name, description, unit, price, offer_price, offer_label, stock_status, is_featured, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000010', 'Lemon', 'Tangy yellow lemons. Essential for cooking, drinks, and cleaning.', 'dozen', 40, NULL, NULL, 'in_stock', FALSE, 1),
  ('c1000000-0000-0000-0000-000000000010', 'Lime (Nimbu)', 'Fresh Indian limes, highly aromatic. For nimbu pani, dals, and pickles.', 'dozen', 30, NULL, NULL, 'in_stock', FALSE, 2),
  ('c1000000-0000-0000-0000-000000000010', 'Orange (Nagpur)', 'Sweet Nagpur oranges. Juicy and vitamin-rich. Season''s best!', 'kg', 80, 70, '12% OFF', 'in_stock', TRUE, 3),
  ('c1000000-0000-0000-0000-000000000010', 'Sweet Lime (Mosambi)', 'Fresh mosambi. Mild, sweet citrus juice. Great for fresh juice.', 'kg', 70, NULL, NULL, 'in_stock', FALSE, 4),
  ('c1000000-0000-0000-0000-000000000010', 'Grapefruit', 'Tangy-sweet grapefruit. Rich in antioxidants and vitamin C.', 'piece', 60, NULL, NULL, 'limited', FALSE, 5),
  ('c1000000-0000-0000-0000-000000000010', 'Mandarin', 'Small, easy-peel mandarins. Sweet and seedless. Kids'' favorite!', 'kg', 90, NULL, NULL, 'in_stock', FALSE, 6);

-- ─────────────────────────────────────────
-- STONE FRUITS
-- ─────────────────────────────────────────
INSERT INTO products (category_id, name, description, unit, price, offer_price, offer_label, stock_status, is_featured, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000011', 'Peach', 'Fresh, fragrant peaches. Sweet-tart flavor with juicy flesh.', 'kg', 150, 130, '13% OFF', 'limited', FALSE, 1),
  ('c1000000-0000-0000-0000-000000000011', 'Plum', 'Dark, sweet plums. Juicy and flavorful. High in antioxidants.', 'kg', 120, NULL, NULL, 'in_stock', FALSE, 2),
  ('c1000000-0000-0000-0000-000000000011', 'Lychee', 'Fresh lychees with floral, sweet flavor. Seasonal delight!', '500g', 80, 70, '12% OFF', 'limited', TRUE, 3),
  ('c1000000-0000-0000-0000-000000000011', 'Longan', 'Sweet longan fruits, similar to lychee. Translucent, juicy flesh.', '500g', 90, NULL, NULL, 'limited', FALSE, 4);

-- ─────────────────────────────────────────
-- BERRIES & GRAPES
-- ─────────────────────────────────────────
INSERT INTO products (category_id, name, description, unit, price, offer_price, offer_label, stock_status, is_featured, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000012', 'Green Grapes', 'Seedless green grapes, crisp and sweet. Perfect for snacking.', 'kg', 80, NULL, NULL, 'in_stock', FALSE, 1),
  ('c1000000-0000-0000-0000-000000000012', 'Black Grapes', 'Sweet black grapes. Rich in antioxidants and resveratrol.', 'kg', 90, NULL, NULL, 'in_stock', FALSE, 2),
  ('c1000000-0000-0000-0000-000000000012', 'Red Globe Grapes', 'Large red globe grapes, sweet and juicy. Perfect for fruit platters.', 'kg', 100, 85, '15% OFF', 'in_stock', FALSE, 3),
  ('c1000000-0000-0000-0000-000000000012', 'Strawberry', 'Fresh strawberries, bright red and sweet. Perfect for desserts and smoothies.', '250g', 80, 65, 'Fresh Deal', 'limited', TRUE, 4),
  ('c1000000-0000-0000-0000-000000000012', 'Blueberry', 'Fresh blueberries, sweet and tangy. Superfood packed with antioxidants.', '125g', 120, NULL, NULL, 'in_stock', FALSE, 5),
  ('c1000000-0000-0000-0000-000000000012', 'Watermelon', 'Juicy red watermelon. The perfect summer fruit! Cold and refreshing.', 'piece', 80, NULL, NULL, 'in_stock', TRUE, 6),
  ('c1000000-0000-0000-0000-000000000012', 'Muskmelon', 'Sweet, fragrant muskmelon. Rich in vitamins A and C.', 'piece', 60, NULL, NULL, 'in_stock', FALSE, 7);

-- ─────────────────────────────────────────
-- EVERYDAY FRUITS
-- ─────────────────────────────────────────
INSERT INTO products (category_id, name, description, unit, price, offer_price, offer_label, stock_status, is_featured, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000013', 'Apple (Shimla)', 'Fresh red Shimla apples. Crisp, sweet and nutritious. A doctor a day!', 'kg', 120, 110, '8% OFF', 'in_stock', TRUE, 1),
  ('c1000000-0000-0000-0000-000000000013', 'Apple (Kashmiri)', 'Premium Kashmiri apples. Larger, sweeter variety with beautiful red color.', 'kg', 150, NULL, NULL, 'in_stock', FALSE, 2),
  ('c1000000-0000-0000-0000-000000000013', 'Pear', 'Juicy, sweet pears. Soft and delicious when ripe.', 'kg', 100, NULL, NULL, 'in_stock', FALSE, 3),
  ('c1000000-0000-0000-0000-000000000013', 'Pomegranate', 'Ruby-red pomegranate, bursting with sweet-tart arils. Rich in antioxidants.', 'piece', 80, NULL, NULL, 'in_stock', FALSE, 4),
  ('c1000000-0000-0000-0000-000000000013', 'Fig (Anjeer)', 'Fresh figs, sweet and nutritious. High in fiber and natural sugars.', '250g', 120, NULL, NULL, 'limited', FALSE, 5),
  ('c1000000-0000-0000-0000-000000000013', 'Sapota (Chikoo)', 'Sweet, brown chikoo with malty flavor. Rich in fiber and natural sugars.', 'kg', 70, NULL, NULL, 'in_stock', FALSE, 6),
  ('c1000000-0000-0000-0000-000000000013', 'Custard Apple (Sitaphal)', 'Creamy, sweet custard apple. Unique flavor, seasonal specialty!', 'piece', 50, NULL, NULL, 'limited', FALSE, 7);

-- ─────────────────────────────────────────
-- EXOTIC & SEASONAL
-- ─────────────────────────────────────────
INSERT INTO products (category_id, name, description, unit, price, offer_price, offer_label, stock_status, is_featured, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000014', 'Dragon Fruit', 'Vibrant pink dragon fruit with white flesh. Mild, sweet flavor and stunning appearance.', 'piece', 80, NULL, NULL, 'in_stock', TRUE, 1),
  ('c1000000-0000-0000-0000-000000000014', 'Kiwi', 'Fresh green kiwi fruits. Tangy, tropical flavor. Rich in vitamin C.', 'piece', 30, NULL, NULL, 'in_stock', TRUE, 2),
  ('c1000000-0000-0000-0000-000000000014', 'Avocado', 'Ripe, creamy avocados. Perfect for guacamole, toasts, and salads.', 'piece', 80, NULL, NULL, 'limited', FALSE, 3),
  ('c1000000-0000-0000-0000-000000000014', 'Passion Fruit', 'Tropical passion fruit with intensely fragrant, sweet-tart pulp.', 'piece', 40, NULL, NULL, 'limited', FALSE, 4),
  ('c1000000-0000-0000-0000-000000000014', 'Star Fruit (Kamrakh)', 'Beautiful star-shaped fruit, crisp and mildly sweet.', 'piece', 30, NULL, NULL, 'in_stock', FALSE, 5),
  ('c1000000-0000-0000-0000-000000000014', 'Rambutan', 'Exotic red rambutan with sweet, translucent flesh. Tropical seasonal treat!', '250g', 120, 100, '16% OFF', 'limited', FALSE, 6);
