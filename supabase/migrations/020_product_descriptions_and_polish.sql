-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 020: Product Descriptions & Final Polish
--
-- A. DESCRIPTIONS: All 98 products rewritten with 25–45 word descriptions.
--    Copy is natural, locally relevant (Tamil Nadu / Chennai context), and
--    distinct per product. No two descriptions use the same phrase structure.
--
-- B. TAMIL NAME FIXES: 2 corrections:
--    • Apple (Shimla): "ஆப்பிள்" → "ஷிம்லா ஆப்பிள்" (distinguish from Kashmiri)
--    • Basil: "துளசி" → "பேசில்" (துளசி is holy basil/Tulsi; this is sweet basil)
--
-- C. IMAGE: Green Grapes given its own NULL so resolver returns
--    a brighter green-grapes image instead of dark grape cluster.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── B. TAMIL NAME FIXES ───────────────────────────────────────────────────────
UPDATE products SET tamil_name = 'ஷிம்லா ஆப்பிள்' WHERE name = 'Apple (Shimla)';
UPDATE products SET tamil_name = 'பேசில்'          WHERE name = 'Basil';

-- ── C. IMAGE FIX ──────────────────────────────────────────────────────────────
-- Green Grapes currently shares the dark-grape image with Black & Red Grapes.
-- Setting NULL lets the resolver return a green-grapes photo.
UPDATE products SET image_url = NULL WHERE name = 'Green Grapes';

-- ── A. DESCRIPTIONS ───────────────────────────────────────────────────────────

UPDATE products SET description = 'Tender araikeerai leaves with a mild, earthy taste. A South Indian kitchen staple for poriyal, kootu, and dal. Quick to cook, easy on the stomach, and unexpectedly affordable. Rich in iron and calcium.' WHERE name = 'Amaranth (Thotakura)';

UPDATE products SET description = 'Prized for their honey-like sweetness and deep red colour, these Kashmiri apples arrive via cold-chain so they stay crisp. Larger and sweeter than regular varieties: best eaten fresh or sliced for fruit platters.' WHERE name = 'Apple (Kashmiri)';

UPDATE products SET description = 'Classic red Shimla apples with a satisfying crunch and mild sweetness. Less intense than Kashmiri apples, making them ideal for juicing, baking, or everyday snacking. Keeps well in the fridge for up to a week.' WHERE name = 'Apple (Shimla)';

UPDATE products SET description = 'The large, silvery-grey vellai pooosani is a South Indian kitchen essential. Used in aviyal, more kuzhambu, and the cooling ash gourd juice popular across Chennai. Naturally light on the digestive system.' WHERE name = 'Ash Gourd';

UPDATE products SET description = 'Buttery, rich avocados: ripe when the skin darkens and gives slightly under thumb pressure. Slice and season with lemon and salt for the simplest breakfast, or mash into guacamole. A filling, nutritious choice.' WHERE name = 'Avocado';

UPDATE products SET description = 'Fat, golden Robusta bananas ripened naturally: sweeter and creamier than smaller varieties. A daily breakfast favourite eaten plain, with curd rice, or mashed into baby food. Rich in potassium and natural energy.' WHERE name = 'Banana (Robusta)';

UPDATE products SET description = 'Soft, fragrant sweet basil leaves with a clove-like aroma: different from Indian Tulsi. Essential for pasta sauces, pesto, and bruschetta. Wilts quickly after purchase, so store wrapped in a damp cloth in the fridge.' WHERE name = 'Basil';

UPDATE products SET description = 'Deep crimson beetroots with earthy sweetness that deepens when cooked. Brilliant in beetroot poriyal, raita, and halwa. The juice turns everything purple: a natural food colouring loved by health-conscious cooks.' WHERE name = 'Beetroot';

UPDATE products SET description = 'Fresh, bright green pavakkai with characteristic ridges and a natural bitter edge. Long trusted for blood sugar balance and liver health. Stuffed and pan-fried or cooked with jaggery to mellow the bitterness beautifully.' WHERE name = 'Bitter Gourd (Karela)';

UPDATE products SET description = 'Deep purple-black grapes with a rich, almost wine-like sweetness. Peel-and-eat convenience with no seeds. Full of resveratrol and antioxidants. Refrigerate after purchase and finish within three days for best flavour.' WHERE name = 'Black Grapes';

UPDATE products SET description = 'Tiny, intense berries from the hills: sweet with a slight tartness when fully ripe. Eat by the handful, stir into yogurt, or blend into smoothies. High in brain-protective antioxidants. Keep refrigerated for best results.' WHERE name = 'Blueberry';

UPDATE products SET description = 'Mild, soft suraikkay that becomes silky and tender once cooked. Used for lauki dal, South Indian kootu, and simple stir-fries. One of the easiest vegetables to digest: especially good in summer or during illness.' WHERE name = 'Bottle Gourd (Lauki)';

UPDATE products SET description = 'Plump, flat pattaipayaru with a creamy, starchy texture once shelled and cooked. Popular in Tamil Nadu for poriyal and rice. Cook simply with mustard seeds, curry leaves, and fresh coconut for a classic preparation.' WHERE name = 'Broad Beans';

UPDATE products SET description = 'Dense, tightly packed florets with no yellowing: the sign of genuine freshness. Stir-fry with garlic, roast with olive oil and pepper, or steam and add to soups. Quick to cook and loved by children for its tree-like shape.' WHERE name = 'Broccoli';

UPDATE products SET description = 'Tight, solid cabbage heads that shred cleanly for vadam, stir-fry, or salads. Equally at home in Tamil, North Indian, and Chinese cooking. Stores without wilting in the fridge for several days after purchase.' WHERE name = 'Cabbage';

UPDATE products SET description = 'Thick-walled green bell peppers with a grassy crunch and mild heat. Stuff them whole, slice for curries, or toss in stir-fries. Milder than any chilli, they add body and colour to dishes without overpowering other flavours.' WHERE name = 'Capsicum Green';

UPDATE products SET description = 'Ripe red bell peppers sweetened by extra time on the vine: far more flavourful than the green variety. Roast or sauté to bring out their natural sugars. Contains three times the vitamin C of a green capsicum.' WHERE name = 'Capsicum Red';

UPDATE products SET description = 'Sunshine-yellow bell peppers, the mildest and sweetest of the three colours. Lovely in pasta, grilled vegetable platters, or raw with hummus. Adds instant colour and a gentle sweetness to any dish.' WHERE name = 'Capsicum Yellow';

UPDATE products SET description = 'Bright orange carrots with a satisfying snap when broken: a real sign of freshness. Used daily in carrot halwa, aviyal, and sambar. High in beta-carotene and sweet enough to eat raw as an after-school snack.' WHERE name = 'Carrot';

UPDATE products SET description = 'Firm, compact cauliflower with tightly bundled white curds and no black spots. Excellent for gobi masala, aloo gobi, and cauliflower fried rice. Breaks apart easily into even florets: no wastage, no trimming needed.' WHERE name = 'Cauliflower';

UPDATE products SET description = 'Crisp, pale green celery stalks with a strong, refreshing aroma. Used in soups, stir-fries, and fresh juicing blends. The leaves are actually more flavourful than the stalks. Keeps refrigerated for up to a week.' WHERE name = 'Celery';

UPDATE products SET description = 'Bite-sized cherry tomatoes with an intense, concentrated sweetness that regular tomatoes cannot match. Excellent roasted in the oven until they burst, or eaten straight from the punnet as a snack. Kids love these.' WHERE name = 'Cherry Tomato';

UPDATE products SET description = 'Slender, bunched kothavarangai with a slightly bitter edge that mellows beautifully when cooked with coconut. A traditional Tamil Nadu vegetable: make it as poriyal, add to sambar, or stir-fry simply with mustard seeds.' WHERE name = 'Cluster Beans (Guar)';

UPDATE products SET description = 'Whole brown coconuts with good water content: shake to hear the slosh inside. Grate for chutneys, thogayal, and gravies, or crack open and drink the water fresh. No South Indian kitchen functions without coconut.' WHERE name = 'Coconut';

UPDATE products SET description = 'Rough-skinned cheppankizhangu with a pleasantly sticky, creamy texture once cooked. Boil and deep-fry with spices for a crispy South Indian-style taro fry, or add to coconut gravies for a hearty texture.' WHERE name = 'Colocasia (Arbi)';

UPDATE products SET description = 'Freshly cut coriander bunches with the earthy, garden-fresh fragrance still intact. Essential for finishing gravies, making chutneys, and garnishing every South Indian dish. Buy in bunches and use within two days for best flavour.' WHERE name = 'Coriander (Dhania)';

UPDATE products SET description = 'Fresh green karamani with a nutty, earthy taste that deepens when cooked. A Tamil Nadu staple in sundal, rice dishes, and curries. Cooks faster than dried lentils and is far richer in plant protein and iron.' WHERE name = 'Cowpeas (Lobia)';

UPDATE products SET description = 'Cool, crunchy cucumber that needs no introduction. Slice into raita, chop for salads, or eat with salt and chilli powder as a side dish. Naturally hydrating at over 95% water content: perfect for Chennai afternoons.' WHERE name = 'Cucumber';

UPDATE products SET description = 'Aromatic fresh curry leaves that release their fragrance the second they hit hot oil: that unmistakable popping sound signals every South Indian tadka. Use generously. No substitute exists for fresh curry leaves in a kuzhambu.' WHERE name = 'Curry Leaves';

UPDATE products SET description = 'Seasonal sitaphal with rough green skin and impossibly creamy white flesh inside: sweet enough to eat as dessert without any additions. Available only for a short season and best enjoyed within a day of purchase.' WHERE name = 'Custard Apple (Sitaphal)';

UPDATE products SET description = 'Feathery, delicate dill leaves with a distinctive anise-like fragrance: lighter than fennel, less pungent than methi. Used in fish preparations, potato subzis, and raita. More common in Andhra and Tamil coastal kitchens.' WHERE name = 'Dill Leaves';

UPDATE products SET description = 'Striking hot-pink dragon fruit with mildly sweet white flesh dotted with tiny black seeds. The taste is refreshing and gentle, somewhere between kiwi and watermelon. Best eaten chilled, scooped straight from the skin.' WHERE name = 'Dragon Fruit';

UPDATE products SET description = 'Long, slender murungakkai: the backbone of Tamil Nadu sambar. Crack a piece and slide out the tender flesh for that unmistakable bittersweet flavour. Completely fresh, not stored. Rich in calcium, iron, and vitamins A and C.' WHERE name = 'Drumstick (Murungakkai)';

UPDATE products SET description = 'Tender young moringa leaves, among the most nutritionally dense greens available anywhere. Stir-fry with garlic, add to rasam, or sun-dry and powder. Slightly bitter when raw, beautifully satisfying once cooked.' WHERE name = 'Drumstick Leaves';

UPDATE products SET description = 'Glossy purple brinjal in peak condition: taut skin and firm flesh are the signs to look for. Used in curries, bharta, and the beloved Tamil ennai katharikkai made with tamarind and spice paste.' WHERE name = 'Eggplant (Brinjal)';

UPDATE products SET description = 'Fresh figs with thin, purple-green skin and jammy, honey-sweet flesh inside. Eat fresh, pair with cheese, or halve and grill with honey. Available for a short season: far superior to dried figs in every way.' WHERE name = 'Fig (Anjeer)';

UPDATE products SET description = 'Slender, long French beans that snap cleanly: the classic freshness test. Stir-fry with garlic and soy, cook as a simple poriyal, or add to mixed vegetable dishes. A quick-cooking everyday vegetable loved in lunch boxes.' WHERE name = 'French Beans';

UPDATE products SET description = 'Fat, firm garlic bulbs with dry, papery skin that peels cleanly. Peel, chop, or crush for gravies, pickles, and marinades. A kitchen essential no South Indian household can do without. Keeps for weeks at room temperature.' WHERE name = 'Garlic';

UPDATE products SET description = 'Fresh, knobby ginger root with a fiery, peppery heat. Grate into curries, brew with lemon and honey for sore throats, or pound into chutneys. Looks and smells completely different from older stored ginger: far more aromatic.' WHERE name = 'Ginger';

UPDATE products SET description = 'Large, pale yellow grapefruit with tart, slightly bitter flesh: an acquired taste that grows on you. Eat halved with a sprinkle of rock salt, or squeeze for a refreshing morning juice. Extremely high in vitamin C.' WHERE name = 'Grapefruit';

UPDATE products SET description = 'Slender, spicy green chillies that provide the characteristic sharp heat of South Indian cooking. Use slit in tadka, chopped in chutneys, or ground into pastes. Heat level varies by batch: taste one before adding to the pot.' WHERE name = 'Green Chilli';

UPDATE products SET description = 'Crisp, seedless green grapes with a sweet-tart balance that works beautifully both fresh and in fruit salads. Best served cold as a snack or with cheese. The slight tartness makes these far more interesting than plain sweet grapes.' WHERE name = 'Green Grapes';

UPDATE products SET description = 'Fresh spring onions with bright green stalks and small white bulbs: mild, versatile, and excellent in fried rice, noodles, soups, and as a garnish. Both the white base and green tops are edible and flavourful.' WHERE name = 'Green Onion (Spring Onion)';

UPDATE products SET description = 'Plump, sweet peas straight from the pod: seasonal and worth every minute of shelling. Far sweeter and more tender than any frozen variety. Pressure-cook briefly, then add to pulao, masala peas, or simply toss with butter and salt.' WHERE name = 'Green Peas (Fresh)';

UPDATE products SET description = 'Firm guavas with thick pink or white flesh inside and a distinctive tropical fragrance. Eat with salt and chilli powder in the Chennai style, juice for breakfast, or blend into jam. The seeds are edible and add a pleasant crunch.' WHERE name = 'Guava';

UPDATE products SET description = 'Fresh avarakkai, one of the most popular beans in Tamil Nadu cooking. Makes an exceptional poriyal with fresh coconut, or adds body to sambar. Recognised by its flat shape and often the purple streak along the length of the pod.' WHERE name = 'Hyacinth Beans (Avarakkai)';

UPDATE products SET description = 'Ripe jackfruit with sticky, intensely sweet yellow flesh: the king of tropical fruits in Tamil Nadu. Eaten fresh, made into payasam, or mixed with rice. Deeply satisfying and very filling. Buy and eat within two days.' WHERE name = 'Jackfruit';

UPDATE products SET description = 'Small, fuzzy brown kiwis hiding a jewel-green, tangy interior. Scoop out with a teaspoon or peel and slice. Tropical-flavoured and refreshing, one kiwi covers your complete daily vitamin C requirement in a single serving.' WHERE name = 'Kiwi';

UPDATE products SET description = 'Curious-looking pale green stem vegetable with a mild, sweet flavour: somewhere between a turnip and an apple when eaten raw. Peel and eat with lemon and salt, or peel, chop, and cook into curries. Underrated but excellent.' WHERE name = 'Kohlrabi';

UPDATE products SET description = 'Young, tender vendaikkai at peak freshness: the tip should snap, not bend. Pan-fry without any water for the crispiest result. Add to sambar, or make the beloved vendakkai puli kuzhambu that features in every Tamil home menu.' WHERE name = 'Lady''s Finger (Okra)';

UPDATE products SET description = 'Bright yellow lemons that juice easily and abundantly. A squeeze over dal, rice, or grilled fish changes the entire dish. Also essential for lemon rice, nimbu pani, and the cold glass of fresh juice that gets you through a Chennai summer.' WHERE name = 'Lemon';

UPDATE products SET description = 'Long, stiff lemongrass stalks that release a burst of citrus fragrance when bruised or sliced. Use the lower stalk in teas, soups, and Thai curries. Keeps for two weeks in the refrigerator. A staple in herbal chai blends.' WHERE name = 'Lemongrass';

UPDATE products SET description = 'Crisp, fresh lettuce with tightly layered leaves that hold their crunch well past washing. Use as a wrap base, in layered salads, or as a bed for grilled proteins. Wash in cold water before use. Keeps 4 to 5 days refrigerated.' WHERE name = 'Lettuce';

UPDATE products SET description = 'Cream-coloured, flat lima beans with a mild, buttery flavour once cooked through. Rich in plant protein and potassium. Works well in curries, rice, and salads. Less common than regular beans but worth trying as a nutritious change.' WHERE name = 'Lima Beans';

UPDATE products SET description = 'Small, thin-skinned Indian limes that pack an intense citrus punch in each squeeze. More aromatic than lemons. Squeeze over chaats, use in nimbu pani, make classic lime pickle, or add to South Indian gravies and rasam.' WHERE name = 'Lime (Nimbu)';

UPDATE products SET description = 'Small, round longans with translucent, juicy flesh and a dark central seed: very similar to lychee in taste, with a mild floral sweetness. Peel and eat chilled. A Southeast Asian tropical fruit, in season for a short period.' WHERE name = 'Longan';

UPDATE products SET description = 'Slender lotus stems that reveal a beautiful hole pattern when sliced crosswise. Slightly crunchy, mild in flavour, and unusual in the best possible way. Stir-fry, pickle, or add to curries. A nutritious and visually striking vegetable.' WHERE name = 'Lotus Stem';

UPDATE products SET description = 'Juicy, flower-scented lychees with translucent flesh that drips when peeled. A seasonal joy available for just a few weeks in Chennai. Eat fresh and cold. Brilliant in fruit punches, pavlova, and summer desserts.' WHERE name = 'Lychee';

UPDATE products SET description = 'Loose-skinned mandarins that peel in seconds without any tools. Sweet, seedless, and fragrant: more perfumed than regular oranges. Easy enough for children to peel alone. A great lunchbox fruit or after-school snack.' WHERE name = 'Mandarin';

UPDATE products SET description = 'The Alphonso: India''s most celebrated mango, grown on the Konkan coast of Maharashtra. Intensely fragrant, completely fibre-free, and so naturally sweet it needs nothing added. Best eaten cold, straight from the refrigerator.' WHERE name = 'Mango (Alphonso)';

UPDATE products SET description = 'Large, golden-yellow Banganapalli mangoes: known locally as Benishan: with generous, fibrous flesh and a distinctive flavour. Andhra''s beloved mango. The best choice for mango dal, mango rice, and simple sliced-and-salted eating.' WHERE name = 'Mango (Banganapalli)';

UPDATE products SET description = 'Fresh, slightly bitter methi leaves with a complex aroma that deepens as they cook. Essential for methi paratha, aloo methi, and South Indian keerai kootu. Soak briefly in salted water to reduce the natural bitterness before cooking.' WHERE name = 'Methi (Fenugreek)';

UPDATE products SET description = 'A bunch of bright green pudina that smells like cool, refreshing water. Used daily in biryanis, chutneys, raita, and the mint lassi that pairs so perfectly with spicy food. Store with stems in a glass of water in the fridge.' WHERE name = 'Mint (Pudina)';

UPDATE products SET description = 'Plump white button mushrooms with no browning or sliminess: both are signs of absolute freshness. Sauté in butter and garlic, add to pasta, stir-fry with soy and capsicum, or fold into egg dishes. Earthy, versatile, and satisfying.' WHERE name = 'Mushroom (Button)';

UPDATE products SET description = 'Golden-skinned muskmelon with pale orange, fragrant flesh: when ripe, the stem end smells intensely sweet. Eat chilled and cubed for breakfast or blend with a little honey for a cooling summer juice. Rich in vitamin A.' WHERE name = 'Muskmelon';

UPDATE products SET description = 'Large, firm red onions with dry, tight-layered skin that cuts cleanly without going soft. The daily essential for every Tamil household: used in every gravy, every stir-fry, and every salad. Keeps at room temperature for two to three weeks.' WHERE name = 'Onion';

UPDATE products SET description = 'The original Nagpur santra: small, deep orange, intensely juicy, and easy to peel without any mess. Nothing compares to a glass of freshly squeezed Nagpur orange juice. Rich in vitamin C and immune-boosting flavonoids.' WHERE name = 'Orange (Nagpur)';

UPDATE products SET description = 'Ripe papaya with bright orange flesh and a sweet, creamy texture that scoops cleanly. Eat fresh first thing in the morning: the natural enzymes aid digestion better than most supplements. Remove seeds before eating.' WHERE name = 'Papaya';

UPDATE products SET description = 'Bright, flat-leaf parsley with a clean, slightly peppery flavour. Chopped into salads, dressings, and tabbouleh, or used as a garnish in Continental dishes. Much more flavourful than curly parsley. Stays fresh refrigerated for five days.' WHERE name = 'Parsley';

UPDATE products SET description = 'Wrinkled purple passion fruits: the more wrinkled, the riper and sweeter the pulp inside. Cut in half and scoop out the intensely tart, fragrant seeds. Swirl into yogurt, juice, or use in desserts for a tropical punch.' WHERE name = 'Passion Fruit';

UPDATE products SET description = 'Soft, downy peaches with golden-orange skin blushed with red and a deeply fruity fragrance. Sweet and juicy when fully ripe. Eat fresh, slice into yogurt, or make a quick jam. Leave at room temperature overnight if still firm.' WHERE name = 'Peach';

UPDATE products SET description = 'Williams pears that soften beautifully at room temperature over a day or two. Sweet, grainy, and delicate: slice into salads, eat with soft cheese, or simply bite in. Refrigerate once ripe to extend freshness by another day or two.' WHERE name = 'Pear';

UPDATE products SET description = 'Fresh, fragrant pineapple that smells deeply sweet near the base when ready. The colour matters less than the scent: a ripe pineapple is unmistakable. Slice, juice, add to fried rice or desserts, or simply eat cold.' WHERE name = 'Pineapple';

UPDATE products SET description = 'Deep red or purple plums with a sweet-sour balance that sharpens near the skin. Best when they yield slightly under gentle pressure: not hard, not soft. Eat fresh, cook into a compote, or pair with thick yogurt for breakfast.' WHERE name = 'Plum';

UPDATE products SET description = 'Heavy, deep-red pomegranates full of ruby-red arils. Tap the cut halves over a bowl to release the seeds cleanly. Eat as is, stir into raita, or press for juice. Rich in antioxidants and genuinely satisfying to prepare.' WHERE name = 'Pomegranate';

UPDATE products SET description = 'Firm, skin-on potatoes grown for cooking: not the hollow, watery type that disintegrates in sambar. Used in masala dosa filling, potato roast, aloo gobi, and a hundred other dishes. A daily non-negotiable in every Chennai kitchen.' WHERE name = 'Potato';

UPDATE products SET description = 'Orange-fleshed pumpkin with dense, slightly sweet flesh that caramelises when roasted. Excellent in South Indian kootu and moolaipayaru kuzhambu, or roast with olive oil and spices for an easy Western-style side dish.' WHERE name = 'Pumpkin';

UPDATE products SET description = 'Long white radish that adds a sharp, peppery crunch when eaten raw and a gentler sweetness when cooked. Slice thin into raita, grate into parathas, or add whole to sambar for extra body. Extremely hydrating with high water content.' WHERE name = 'Radish (Mooli)';

UPDATE products SET description = 'Bright red rambutan covered in hair-like spines that are harmless to the touch. Peel back the spiny skin to find translucent, grape-like flesh inside: sweet and very juicy. An exotic tropical treat, in season for a few weeks.' WHERE name = 'Rambutan';

UPDATE products SET description = 'Firm raw banana (plantain) used in distinctly South Indian cooking. Slice thin for crispy chips, cook in coconut-based curries, or steam and eat with gingelly oil and salt. An absolutely essential ingredient in traditional Tamil Nadu cuisine.' WHERE name = 'Raw Banana';

UPDATE products SET description = 'Sour, hard raw mangoes: the real deal for avakaya pickle, mango rice, and the tangy mango pachadi served at Tamil weddings. Refreshing when sliced with rock salt and chilli. Seasonal, available only during the mango months.' WHERE name = 'Raw Mango';

UPDATE products SET description = 'Plump, fiery red chillies that dry beautifully at room temperature. Used in chutneys, pickles, and ground spice powders. The seeds carry most of the heat: remove them to reduce intensity. Wear gloves when processing in bulk.' WHERE name = 'Red Chilli';

UPDATE products SET description = 'Large, round red globe grapes with a firm bite and balanced natural sweetness. Travels well without bruising. Best served cold as a dessert or on a cheese board. Seedless and easy to eat: excellent for entertaining.' WHERE name = 'Red Globe Grapes';

UPDATE products SET description = 'Fresh peerkangai with prominent ridges that need scraping before chopping. Makes one of the most underrated South Indian chutneys and an easy dal when peeled and cooked. Light, digestible, and genuinely delicious with simple seasoning.' WHERE name = 'Ridge Gourd';

UPDATE products SET description = 'Brown, rough-skinned chikoo with a malty, caramel sweetness unlike any other fruit. Eat when the skin gives under gentle pressure: under-ripe sapota is extremely astringent. Scoop the flesh or slice in half and eat with a spoon.' WHERE name = 'Sapota (Chikoo)';

UPDATE products SET description = 'Long, slender pudalangai: peel, remove seeds, and chop for dal, poriyal, and the classic South Indian snake gourd sabzi. Milder and more delicate in flavour than ridge gourd. A familiar fixture on every Tamil Nadu lunch menu.' WHERE name = 'Snake Gourd';

UPDATE products SET description = 'Bright, tender palak leaves with no yellowing or wilting. A quick-cooking green that transforms dal, saag, and curries. Rich in iron, folate, and vitamin K. Blanch quickly in hot water to preserve the vivid colour and nutrients.' WHERE name = 'Spinach (Palak)';

UPDATE products SET description = 'Star-shaped carambola that looks extraordinary when sliced crosswise. The taste is refreshing and mild: sweet-tart and watery with a crisp texture. Excellent in fruit salads, as a garnish, or juiced for a light, tropical drink.' WHERE name = 'Star Fruit (Kamrakh)';

UPDATE products SET description = 'Bright red strawberries with a genuine, natural fragrance: no artificial colouring or ripening. Eat fresh with cream, blend into milkshakes, or hull and freeze for smoothies. Best consumed within two days of purchase for peak flavour.' WHERE name = 'Strawberry';

UPDATE products SET description = 'Plump, sweet corn cobs bursting with natural sugar that reduces quickly after harvest: which is why fresh-from-the-field corn is so much sweeter. Boil ten minutes with butter and salt, or cut kernels for fried rice and pasta.' WHERE name = 'Sweet Corn';

UPDATE products SET description = 'Pale green mosambi with barely-acidic, incredibly mild juice. The citrus drink South Indian hospitals serve for good reason: hydrating, gentle, and restorative. Squeeze and strain for the most soothing fresh citrus drink available.' WHERE name = 'Sweet Lime (Mosambi)';

UPDATE products SET description = 'Dense, orange-fleshed sakkaraivalli kizhangu that roasts beautifully with caramelised edges. Far sweeter than regular potato: eat steamed with butter, roast with spices, or make the traditional sweet potato kozhukattai for festivals.' WHERE name = 'Sweet Potato';

UPDATE products SET description = 'Ripe, red tomatoes with real acidity and firm flesh that holds its shape when cut: not the watery kind. Sourced fresh each morning for the best sambar, rasam, tomato chutney, and gravies that form the base of Tamil cooking.' WHERE name = 'Tomato';

UPDATE products SET description = 'Fresh yellow turmeric rhizomes: the raw, unprocessed form of the golden spice. Extremely vibrant in colour (it will stain!) and intensely fragrant. Grate into curries, brew as golden milk with warm cow''s milk, or slice and pickle.' WHERE name = 'Turmeric Root';

UPDATE products SET description = 'Pale purple and white turnips with a mild, sweetish flavour that softens beautifully in soups and sambar. Less common in South Indian cooking but excellent for variety: the earthy sweetness intensifies when roasted with a little oil.' WHERE name = 'Turnip';

UPDATE products SET description = 'Whole, ripe watermelons: tap the surface and listen for a deep hollow sound to confirm ripeness. Perfectly refreshing on any Chennai afternoon. Slice, cube, or blend into a simple juice with a little lemon and black salt.' WHERE name = 'Watermelon';

UPDATE products SET description = 'Large chenaikizhangu: a Tamil Nadu favourite for crispy chips, rich curry, and the beloved senai varuval. Dense, slightly sticky texture when raw that transforms completely once deep-fried or pressure-cooked. Very filling and satisfying.' WHERE name = 'Yam (Senai)';

UPDATE products SET description = 'Light green zucchini with a neutral, delicate flavour that soaks up seasoning and spices perfectly. Grill with olive oil, stir-fry with garlic and butter, or layer into baked dishes. Very low in calories, quick to cook, and widely versatile.' WHERE name = 'Zucchini';
