/**
 * Smart bilingual search for KR Vegetables & Fruits
 *
 * Handles:
 *   1. Tanglish → English expansion  (vazhai thandu → banana stem)
 *   2. Substring matching across name, tamil_name, category
 *   3. Levenshtein fuzzy matching for typos (tamoto → tomato)
 */

// ─── Tanglish / alternate-name dictionary ────────────────────────────────────
// Keys: tanglish terms (lowercase, normalised)
// Values: English search keywords that map to the same product
const DICT = {
  // ── Banana family ────────────────────────────────────────────────────────
  'vazhai':           ['banana', 'plantain'],
  'valai':            ['banana', 'plantain'],
  'vazhakkai':        ['raw banana', 'plantain', 'green banana'],
  'valakkai':         ['raw banana', 'plantain'],
  'vazhai thandu':    ['banana stem', 'banana trunk'],
  'valai thandu':     ['banana stem'],
  'vazhai poo':       ['banana flower', 'banana blossom'],
  'vazhaipoo':        ['banana flower', 'banana blossom'],
  'vazhapoo':         ['banana flower'],
  'vazhaipazham':     ['banana'],
  'vazhapazham':      ['banana'],

  // ── Greens / Keerai ──────────────────────────────────────────────────────
  'keerai':           ['keerai', 'spinach', 'greens', 'leaves'],
  'kerai':            ['keerai', 'spinach', 'greens'],
  'keera':            ['keerai', 'spinach', 'greens'],
  'arai keerai':      ['arai keerai', 'amaranth'],
  'mulai keerai':     ['mulai keerai', 'spinach'],
  'siru keerai':      ['siru keerai'],
  'pasalai':          ['pasalai keerai', 'spinach'],
  'pasali':           ['pasalai keerai', 'spinach'],
  'agathi':           ['agathi keerai', 'agati'],
  'manathakkali':     ['manathakkali keerai', 'wonder berry'],

  // ── Herbs ────────────────────────────────────────────────────────────────
  'kothamalli':       ['coriander', 'cilantro', 'dhania'],
  'kothimalli':       ['coriander', 'cilantro'],
  'kodhamballi':      ['coriander'],
  'pudhina':          ['mint', 'pudina'],
  'pudina':           ['mint'],
  'karuvaipillai':    ['curry leaves', 'curry leaf'],
  'karuvepilai':      ['curry leaves'],
  'karivepilai':      ['curry leaves'],
  'kadi patta':       ['curry leaves'],

  // ── Drumstick / Moringa ──────────────────────────────────────────────────
  'murungakkai':      ['drumstick', 'moringa'],
  'murungai':         ['drumstick', 'moringa'],
  'muringakkai':      ['drumstick'],
  'moringakkai':      ['drumstick'],

  // ── Tomato ───────────────────────────────────────────────────────────────
  'thakkali':         ['tomato'],
  'takkali':          ['tomato'],
  'thakali':          ['tomato'],
  'takali':           ['tomato'],
  'tomatoe':          ['tomato'],
  'tamato':           ['tomato'],
  'tamoto':           ['tomato'],
  'tamatoe':          ['tomato'],
  'tamatar':          ['tomato'],

  // ── Onion ────────────────────────────────────────────────────────────────
  'vengayam':         ['onion', 'shallot'],
  'vengayum':         ['onion'],
  'vengaayam':        ['onion'],
  'chinna vengayam':  ['shallot', 'small onion'],
  'sambar onion':     ['shallot', 'small onion'],
  'pyaz':             ['onion'],

  // ── Garlic / Ginger ──────────────────────────────────────────────────────
  'poondu':           ['garlic'],
  'pundu':            ['garlic'],
  'inji':             ['ginger'],
  'injee':            ['ginger'],
  'adrak':            ['ginger'],

  // ── Brinjal ──────────────────────────────────────────────────────────────
  'kathirikkai':      ['brinjal', 'eggplant', 'aubergine', 'baingan'],
  'kathiri':          ['brinjal', 'eggplant'],
  'katharikai':       ['brinjal'],
  'katrikai':         ['brinjal'],

  // ── Okra ─────────────────────────────────────────────────────────────────
  'vendakkai':        ['ladies finger', 'okra', 'bhindi'],
  'vendakai':         ['ladies finger', 'okra'],
  'bhindi':           ['ladies finger', 'okra'],

  // ── Bitter gourd ─────────────────────────────────────────────────────────
  'pavakkai':         ['bitter gourd', 'bitter melon', 'karela'],
  'paavakkai':        ['bitter gourd'],
  'pavkai':           ['bitter gourd'],
  'karela':           ['bitter gourd'],

  // ── Gourds ───────────────────────────────────────────────────────────────
  'podalangai':       ['snake gourd'],
  'pudalangai':       ['snake gourd'],
  'padwal':           ['snake gourd'],
  'peerkangai':       ['ridge gourd', 'turai'],
  'peerkan':          ['ridge gourd'],
  'beerakaya':        ['ridge gourd'],
  'soraikkai':        ['bottle gourd', 'lauki', 'dudhi'],
  'suraikai':         ['bottle gourd'],
  'lauki':            ['bottle gourd'],
  'poosanikai':       ['ash gourd', 'white pumpkin', 'pumpkin'],
  'poosinikai':       ['ash gourd', 'pumpkin'],
  'manjal poosanikai':['pumpkin', 'yellow pumpkin'],
  'kumbalam':         ['ash gourd', 'pumpkin'],

  // ── Beans ────────────────────────────────────────────────────────────────
  'kothavarangai':    ['cluster beans', 'gavar', 'gawar beans'],
  'kotavarangai':     ['cluster beans'],
  'avarakkai':        ['broad beans', 'flat beans', 'field beans'],
  'mochai':           ['field beans', 'mochai'],
  'beans':            ['beans', 'french beans', 'green beans'],

  // ── Root vegetables ──────────────────────────────────────────────────────
  'urulaikizhangu':   ['potato', 'aloo'],
  'urulai':           ['potato', 'aloo'],
  'urulakizhangu':    ['potato'],
  'aloo':             ['potato'],
  'seppankizhangu':   ['taro', 'colocasia', 'arbi'],
  'sepankizhangu':    ['taro', 'colocasia'],
  'cheppankizhangu':  ['taro', 'colocasia'],
  'arbi':             ['taro', 'colocasia'],
  'senaikizhangu':    ['yam', 'elephant yam'],
  'senai':            ['yam', 'elephant yam'],
  'karunai':          ['purple yam', 'karunaikizhangu'],
  'sakkaravalli':     ['sweet potato'],
  'mulangi':          ['radish', 'mooli'],
  'mullangi':         ['radish'],
  'mooli':            ['radish'],
  'carrot':           ['carrot', 'gajar'],
  'karot':            ['carrot'],
  'gajar':            ['carrot'],
  'beetroot':         ['beetroot', 'beet'],

  // ── Capsicum / Chilli ────────────────────────────────────────────────────
  'kudamilagai':      ['capsicum', 'bell pepper'],
  'kudamolagai':      ['capsicum'],
  'milagai':          ['chilli', 'green chilli', 'chili'],
  'molagai':          ['chilli'],
  'green chilli':     ['green chilli', 'chilli'],
  'kamala':           ['orange'],

  // ── Other vegetables ─────────────────────────────────────────────────────
  'pattani':          ['peas', 'green peas'],
  'muttaikose':       ['cabbage'],
  'muttaikos':        ['cabbage'],
  'kose':             ['cabbage'],
  'sundakkai':        ['turkey berry', 'sundakkai'],
  'corn':             ['corn', 'maize', 'sweet corn'],
  'kollu':            ['horse gram'],
  'vellarikai':       ['cucumber'],
  'vellari':          ['cucumber'],

  // ── Fruits ───────────────────────────────────────────────────────────────
  'maampazham':       ['mango'],
  'mangai':           ['raw mango', 'green mango'],
  'maangai':          ['raw mango'],
  'koyyapazham':      ['guava'],
  'koyya':            ['guava'],
  'guva':             ['guava'],
  'pappaali':         ['papaya'],
  'pappali':          ['papaya'],
  'papali':           ['papaya'],
  'thiratchai':       ['grapes'],
  'thiratcai':        ['grapes'],
  'tharboosani':      ['watermelon'],
  'tarboosani':       ['watermelon'],
  'tharbusani':       ['watermelon'],
  'mathulam':         ['pomegranate'],
  'mathalam':         ['pomegranate'],
  'aththi':           ['fig'],
  'sapotha':          ['sapota', 'chickoo'],
  'seethapazham':     ['custard apple'],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalise(str) {
  return (str || '').toLowerCase().trim().replace(/\s+/g, ' ')
}

/** Levenshtein distance — capped for performance */
function lev(a, b) {
  if (Math.abs(a.length - b.length) > 3) return 99
  const m = a.length, n = b.length
  const prev = Array.from({ length: n + 1 }, (_, i) => i)
  const curr = new Array(n + 1)
  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1])
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j]
  }
  return prev[n]
}

/**
 * Expand a raw query into a de-duplicated list of search terms.
 * e.g. "vazhai thandu" → ["banana stem", "banana trunk", "vazhai thandu"]
 *      "keerai"        → ["keerai", "spinach", "greens", "leaves"]
 *      "tomato"        → ["tomato"]          (passthrough)
 */
function expandQuery(raw) {
  const q = normalise(raw)
  const terms = new Set([q])

  // Full-phrase lookup
  if (DICT[q]) DICT[q].forEach((t) => terms.add(t))

  // Token-by-token lookup (handles multi-word queries where each word is tanglish)
  const tokens = q.split(' ')
  tokens.forEach((tok) => {
    terms.add(tok)
    if (DICT[tok]) DICT[tok].forEach((t) => terms.add(t))
  })

  // Sliding window for 2- and 3-word combos within the query
  for (let len = 2; len <= Math.min(tokens.length, 3); len++) {
    for (let i = 0; i <= tokens.length - len; i++) {
      const phrase = tokens.slice(i, i + len).join(' ')
      if (DICT[phrase]) DICT[phrase].forEach((t) => terms.add(t))
    }
  }

  return [...terms]
}

/**
 * Score a single product against a list of expanded search terms.
 * Returns 0 if no match at all.
 */
function scoreProduct(product, terms) {
  const name     = normalise(product.name)
  const tamil    = normalise(product.tamil_name)
  const category = normalise(product.categories?.name)
  const haystack = [name, tamil, category]

  let score = 0

  for (const term of terms) {
    if (!term) continue
    const tlen = term.length

    // ── Exact product name ──
    if (name === term)                  { score += 120; continue }

    // ── Starts-with ──
    if (name.startsWith(term))          { score += 80; continue }
    if (tamil.startsWith(term))         { score += 80; continue }

    // ── Contains (any field) ──
    let contained = false
    for (const h of haystack) {
      if (h.includes(term)) { score += 60; contained = true; break }
    }
    if (contained) continue

    // ── Word-boundary match (term is a whole word inside name) ──
    const wordRe = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')
    if (wordRe.test(name) || wordRe.test(tamil)) { score += 50; continue }

    // ── Fuzzy per token in the product name (handles typos) ──
    if (tlen >= 4) {
      const nameTokens = name.split(' ')
      for (const nt of nameTokens) {
        if (nt.length >= 3) {
          const d = lev(term, nt)
          if (d === 1)       { score += 40; break }
          else if (d === 2 && tlen >= 5) { score += 20; break }
        }
      }
    }
  }

  return score
}

/**
 * Main entry point.
 * Returns products sorted by relevance. Products with score 0 are excluded.
 */
export function smartSearch(products, query) {
  const q = normalise(query)
  if (!q) return products   // no query → return everything

  const terms = expandQuery(q)

  const scored = products
    .map((p) => ({ p, s: scoreProduct(p, terms) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)

  return scored.map(({ p }) => p)
}
