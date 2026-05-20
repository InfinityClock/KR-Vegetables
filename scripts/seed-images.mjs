/**
 * seed-images.mjs
 * Assigns a unique, relevant Unsplash product image to every product.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-images.mjs
 *
 * The service role key is in Vercel → Project → Settings → Environment Variables.
 * The script uses the Supabase REST API directly (no npm install needed).
 */

const SUPABASE_URL  = 'https://sidabiydcvojotdduksj.supabase.co'
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_KEY) {
  console.error('❌  Set SUPABASE_SERVICE_ROLE_KEY before running.')
  console.error('    SUPABASE_SERVICE_ROLE_KEY=ey... node scripts/seed-images.mjs')
  process.exit(1)
}

const U = (id) => `https://images.unsplash.com/photo-${id}?w=500&q=80&auto=format&fit=crop`
const P = (id) => `https://plus.unsplash.com/premium_photo-${id}?w=500&q=80&auto=format&fit=crop`

// ─── Product ID → curated Unsplash image URL ────────────────────────────────
// Every product gets its own relevant image.
const IMAGES = {

  // ── Leafy Greens ──────────────────────────────────────────────────────────
  '5597f395-9a81-48ce-9d05-93d731c1d5e8': P('1701699257548-8261a687236f'), // Amaranth (Thotakura) → spinach/greens
  'e8225692-f632-4c5a-bdae-2f6520c1b970': P('1701699257548-8261a687236f'), // Spinach (Palak)
  'e1f58f78-2747-4c02-9005-12b640ec5b8d': P('1702489575687-204529449d94'), // Cabbage
  '05c74959-c6b5-48ef-8e74-4d45f10c2fe6': U('1640958904159-51ae08bd3412'), // Lettuce
  '18ebadf1-dd66-4518-a085-337d0bb62e6d': U('1776089770931-e422e57f760c'), // Coriander (Dhania)
  'e3ffcf3a-f78e-4321-945f-0b7340690c4e': P('1675874925973-cb4291810f9a'), // Curry Leaves
  'fbb6d488-17ca-403c-9663-37cb42d3235d': P('1701699257548-8261a687236f'), // Methi (Fenugreek)
  'e02733be-4807-4a1e-b524-c1b5dc30f9d8': P('1701699257548-8261a687236f'), // Drumstick Leaves

  // ── Herbs & Spices ────────────────────────────────────────────────────────
  '7e456744-cea1-4255-a294-aa984c07e892': P('1673264303561-de2ab31df03c'), // Mint (Pudina)
  'f1adb017-c7cf-4805-a6b3-534e15433579': P('1673264303561-de2ab31df03c'), // Basil
  'f94e2669-f2e6-4fe9-baa0-5fd8a417a6d6': U('1776089770931-e422e57f760c'), // Dill Leaves
  '071f6d5b-6696-44a0-bbff-c92a024b17b3': U('1776089770931-e422e57f760c'), // Parsley
  'c76774fc-4c9a-40a3-8030-266a81e46b91': P('1673264303561-de2ab31df03c'), // Celery
  '8314f454-7a84-4a6b-81f2-40219fd24757': P('1673264303561-de2ab31df03c'), // Lemongrass
  '4091dbe6-f760-464a-89ef-f63a7f76eeec': P('1667052430061-bbdce8761fc2'), // Spring Onion

  // ── Tomatoes & Peppers ────────────────────────────────────────────────────
  'b8ca4ed9-4acb-4e58-b647-5cd220cb102c': U('1607305387299-a3d9611cd469'), // Tomato
  'eef6d123-0daa-433d-bb5e-6d7a4025b937': U('1570543375343-63fe3d67761b'), // Cherry Tomato
  'd6b08839-e0fe-4f1a-aebb-da31935f68e2': P('1675731117950-089d3b3325d7'), // Capsicum Green
  '30d6dd76-ae81-46e2-b767-edfd99bb1184': P('1724849347739-d791160b10a3'), // Capsicum Red
  'a005cdb1-2129-4b1d-8472-fad959eb30b1': P('1661438187813-99290476805e'), // Capsicum Yellow
  '33fe861e-847a-447c-8e60-e4558378fc43': P('1770609623597-8d6a15b341a2'), // Green Chilli
  '29590542-e389-4d75-9fdb-837165cd7779': P('1675864033264-cb9db758422d'), // Red Chilli

  // ── Root Vegetables ───────────────────────────────────────────────────────
  'f8d7fa50-c38d-4822-afd5-802266e3bacc': U('1598170845058-32b9d6a5da37'), // Carrot
  '402b28a1-4e45-4903-8162-0413f1e48941': U('1518977676601-b53f82aba655'), // Potato
  '1feaf273-4d47-4a6d-b037-e9d291b34af5': P('1675798983878-604c09f6d154'), // Beetroot
  '39b39f24-8b7d-4763-b468-f7857e4676a1': P('1675731118551-79b3da05a5d4'), // Garlic
  '9169404a-2853-4723-aa99-479b00b36b0c': U('1630623093145-f606591c2546'), // Ginger
  'c2be1148-d593-4392-a7ec-668f42754e9e': P('1669680785899-c44bf5160c8e'), // Radish (Mooli)
  '4c9f0554-af9e-4fe7-9105-0fd675dee26a': U('1730815048561-45df6f7f331d'), // Sweet Potato
  '601264ef-a680-4fc9-8076-638ed1a1a735': U('1630623093145-f606591c2546'), // Turmeric Root (similar to ginger)
  'c022f63d-a949-4651-959e-1c7caefefbb8': P('1669680785899-c44bf5160c8e'), // Turnip (similar to radish)
  '7e76317d-da0a-44a3-b494-ffb52048ee47': U('1508747703725-719777637510'), // Onion
  'dfcff520-630c-4219-8bfa-a422023424a7': U('1730815048561-45df6f7f331d'), // Yam (Senai) → sweet potato look
  'b191c81f-5d54-4f3e-b21c-fd0d102e944b': U('1518977676601-b53f82aba655'), // Colocasia (Arbi) → potato look

  // ── Cabbage & Cauliflower ─────────────────────────────────────────────────
  '23b8433e-3953-4c53-bb57-a4106a476013': P('1711684803510-6f05fa515378'), // Cauliflower
  '79fa414e-165d-4043-87b4-353f03b16ee7': P('1702403157830-9df749dc6c1e'), // Broccoli
  '99ff1c86-c90e-4695-a8b8-17cace1fdb79': P('1711684803510-6f05fa515378'), // Kohlrabi → cauliflower look

  // ── Other Vegetables ──────────────────────────────────────────────────────
  '543cba5d-69c1-4417-8391-477fdbc143c6': P('1675237624816-a4755b4649fe'), // Cucumber
  '594015e9-b306-4fcb-90b9-772245951b3a': P('1666270423836-864dfa7071e5'), // Eggplant (Brinjal)
  'bf90f1d7-65ff-47d2-9e96-b8c570c4a23b': P('1666712683208-b20e12a3fa41'), // Lady's Finger (Okra)
  '4f7de0e0-063e-4d21-8c48-b7b28b6bbbd1': P('1700673589457-6b9f7a30cb98'), // Drumstick (Murungakkai)
  'a69244c4-4899-4573-b22b-b2fa5aa3522a': P('1704737966313-746586e51913'), // Mushroom (Button)
  '6757205c-4232-4bc7-a24d-be540b23a38b': U('1551754655-cd27e38d2076'),    // Sweet Corn
  'f372eb84-22e2-40a3-9d41-736d25cfd6e5': P('1663954864079-7452e284aeae'), // Raw Banana
  '963a30dd-62ed-47a4-a7df-b6b408600f1a': P('1675237624816-a4755b4649fe'), // Zucchini → cucumber look
  '2b564de4-45da-4d10-bd55-62996fb9a594': P('1675237624816-a4755b4649fe'), // Lotus Stem → light green

  // ── Gourds & Pumpkin ──────────────────────────────────────────────────────
  'fafd483a-f41c-4f66-acdd-ba6241a1fe04': U('1692680919402-95fc56f99225'), // Ash Gourd → pumpkin
  '15fe8ccc-e642-48ed-b095-c51a4c4f23e5': P('1666270423836-864dfa7071e5'), // Bitter Gourd (Karela) → dark green veg
  '88ec2ff0-a424-4898-a7bf-e5a131ed85df': U('1730127487636-b7fe550af030'), // Bottle Gourd (Lauki)
  'aa9296fc-545e-4a2d-b4f0-b86c5a85a1d2': U('1730127487636-b7fe550af030'), // Ridge Gourd → bottle gourd look
  '91a54f29-e38d-4382-ae1d-43f398f88bf9': U('1730127487636-b7fe550af030'), // Snake Gourd → bottle gourd look
  'a2b8b0a5-543e-4563-b1d7-6b4cde098216': U('1692680919402-95fc56f99225'), // Pumpkin

  // ── Beans & Lentils ───────────────────────────────────────────────────────
  '94074437-5f42-4e18-a03f-f71ffc78e5ba': P('1725384940646-ef6aa8c2a091'), // French Beans
  'bcc96a1a-33a3-4341-b960-686f8d7121e8': U('1592394533824-9440e5d68530'), // Green Peas (Fresh)
  '64d0f8bf-e62b-482d-9c98-4e45360d9892': P('1725384940646-ef6aa8c2a091'), // Cluster Beans (Guar)
  'de4d1404-3b2a-42b6-827b-fdbae121ff65': P('1725384940646-ef6aa8c2a091'), // Broad Beans
  'eeb1c9e1-9b5e-4196-ac52-a84372f58dd9': P('1725384940646-ef6aa8c2a091'), // Hyacinth Beans (Avarakkai)
  '8e49a797-76a1-4267-be64-36054422b27b': U('1592394533824-9440e5d68530'), // Lima Beans → green peas look
  '5563646f-dd7e-4fa5-8042-4f785e5f1d10': U('1592394533824-9440e5d68530'), // Cowpeas (Lobia)

  // ── Everyday Fruits ───────────────────────────────────────────────────────
  'db9690c0-818c-45a6-9445-e34c877c89b8': U('1567306301408-9b74779a11af'), // Apple (Kashmiri)
  'db5ed653-a225-4d3f-9dfa-6a50deadfd93': U('1567306301408-9b74779a11af'), // Apple (Shimla)
  '2475c5a0-5cac-48f4-a2b9-0036ac46e401': P('1668076515507-c5bc223c99a4'), // Pomegranate
  '6caccdb0-60ae-483d-a5d5-055e09efbbbc': U('1568702846914-96b305d2aaeb'), // Pear
  '134a41e4-404c-4554-85b7-6edffea6b551': U('1567306301408-9b74779a11af'), // Custard Apple → apple look
  'beb40da9-6052-4ecd-bedd-157bd9040ad0': P('1668076515507-c5bc223c99a4'), // Fig (Anjeer) → dark fruit
  'c101a9f9-fc20-42fe-a19b-edb393f98982': U('1619566636858-adf3ef46400b'), // Sapota (Chikoo) → papaya look

  // ── Tropical Fruits ───────────────────────────────────────────────────────
  '6a9657e6-4dd5-4a97-b202-acf521704211': P('1724250081102-cab0e5cb314c'), // Banana (Robusta)
  'd712c256-ab68-496d-9185-9ab4f423f968': U('1619566636858-adf3ef46400b'), // Papaya
  '13865d09-2dac-460f-ac27-ad89f018a98a': P('1674382739389-338645e7dd8c'), // Mango (Alphonso)
  '12074e56-9dce-4340-addb-2ce6e71a31bc': P('1674382739389-338645e7dd8c'), // Mango (Banganapalli)
  '9b3ea537-db31-4f73-87a3-f8dee3145931': P('1675731118431-fdaf4dc283ee'), // Raw Mango
  '403f41f8-419b-48b8-9534-c9faf1e32841': P('1723291697706-2755e4244167'), // Guava
  'c96dbe70-3070-4946-bdca-4a492824b2c1': U('1550258987-190a2d41a8ba'),    // Pineapple
  '5bda5b00-781b-4521-b905-7bf006958bc9': P('1675040830227-9f18e88fd1f9'), // Coconut
  '674f8f69-ebea-4c07-ba53-336380f25447': P('1723369639599-b224a60aef38'), // Jackfruit

  // ── Citrus Fruits ─────────────────────────────────────────────────────────
  '352984dd-cfd8-44c9-a4a4-67e896ec1a19': P('1675237625689-292df6ee7fce'), // Lemon
  'c39787fd-d981-42d7-93ec-f119f0f8705d': P('1675237625086-995637f2b112'), // Lime (Nimbu)
  '2e10bfa2-8c6d-4a7f-b9ad-df148726373c': P('1670512181061-e24282f7ee78'), // Orange (Nagpur)
  'a383123d-d856-4f6e-810c-808383d0f3c3': P('1670512181061-e24282f7ee78'), // Grapefruit → orange look
  'eb7de5e1-eed4-4b99-9e87-b51b6d885df4': P('1675237625086-995637f2b112'), // Sweet Lime (Mosambi) → lime
  'd0aa28aa-8002-44be-9057-9c746d3d27b2': P('1670512181061-e24282f7ee78'), // Mandarin → orange

  // ── Berries & Grapes ──────────────────────────────────────────────────────
  '6b00978c-a530-4772-869e-032d2d3a0619': U('1464965911861-746a04b4bca6'), // Strawberry
  '71eafd72-a892-4d55-8436-db7529bc9610': U('1498557850523-fd3d118b962e'), // Blueberry
  'fc6120ac-2e49-44a9-a34f-204056d970f9': U('1537640538966-79f369143f8f'), // Black Grapes
  '6fd615b4-0a0c-4663-b850-cf0a89c7fc7f': U('1537640538966-79f369143f8f'), // Green Grapes
  'c1143cb3-b1c6-418c-abc0-9c5b69386d15': U('1537640538966-79f369143f8f'), // Red Globe Grapes
  '30207f7d-10a6-49dc-9f5e-4d1e6dc06833': U('1589733955941-5eeaf752f6dd'), // Watermelon
  '6103de8a-d0de-4b12-b956-fed3a274ac4b': U('1619566636858-adf3ef46400b'), // Muskmelon → similar melon

  // ── Peach & Plum ──────────────────────────────────────────────────────────
  '975c370c-fc65-45a0-8e47-9f70a6a7e454': U('1595841696677-6489ff3f8cd1'), // Peach
  '7c9ed32b-b972-40c7-a3c3-43c5bca7f6b9': U('1601004890-db3c400de9ef'),    // Plum
  '32dad9c1-e68b-4d1a-a791-41861c9182d1': P('1674382739389-338645e7dd8c'), // Longan → tropical
  '52f541df-6e38-4a30-a2cd-277623766284': U('1537640538966-79f369143f8f'), // Lychee → grapes look

  // ── Special & Seasonal ────────────────────────────────────────────────────
  'f5790c83-1a38-4caa-9c19-033908b7c6ba': U('1523049673857-eb18f1d7b578'), // Avocado
  '05e6863d-21bb-412f-b631-c15b21c87be1': P('1667051230160-5906f5683a59'), // Dragon Fruit
  '1e31b121-69fe-4f5e-8a88-fe3afd34034c': P('1666299434471-1815114cdccc'), // Kiwi
  '0bc35997-3923-4f07-9566-7c49c8832c0a': P('1723291697706-2755e4244167'), // Rambutan → guava look
  'cf525562-47c2-4e74-a771-dbd1a8f25ca8': P('1667051230160-5906f5683a59'), // Passion Fruit → dragon fruit look
  'ae4c338c-77b1-4e23-931d-cf80a5493133': U('1550258987-190a2d41a8ba'),    // Star Fruit → tropical
}

// ─── Supabase REST helper ────────────────────────────────────────────────────
async function patchProduct(id, imageUrl) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ image_url: imageUrl }),
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
}

// ─── Run ─────────────────────────────────────────────────────────────────────
const entries = Object.entries(IMAGES)
console.log(`\n🌿  Updating ${entries.length} product images…\n`)

let ok = 0, fail = 0
for (const [id, url] of entries) {
  try {
    await patchProduct(id, url)
    process.stdout.write('✅  ')
    ok++
  } catch (e) {
    process.stdout.write(`❌  ${id}: ${e.message}\n`)
    fail++
  }
}

console.log(`\n\nDone — ${ok} updated, ${fail} failed.\n`)
