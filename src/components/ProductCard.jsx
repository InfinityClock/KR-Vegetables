import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { formatPrice, getDiscountPercent } from '../utils/format'
import toast from 'react-hot-toast'

// ── Smart image resolution ────────────────────────────────────────────────────
// Maps common produce keywords to high-quality Unsplash/Pexels photos.
// Used only when the product has no image_url set in the DB.
//
// IMPORTANT: More-specific multi-word keys must come BEFORE single-word keys
// so "bitter gourd" matches before "gourd", "sweet potato" before "potato", etc.
// Object.entries() preserves insertion order in V8/all modern JS engines.
const FOOD_IMAGES = {
  // ── Leafy Greens ──────────────────────────────────────────────────────────
  spinach:          'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
  palak:            'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
  amaranth:         'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
  araikeerai:       'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
  'drumstick leaves':'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=400&q=80',
  murungai:         'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=400&q=80',
  methi:            'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&q=80',
  fenugreek:        'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&q=80',
  coriander:        'https://images.pexels.com/photos/1435896/pexels-photo-1435896.jpeg?auto=compress&w=400',
  dhania:           'https://images.pexels.com/photos/1435896/pexels-photo-1435896.jpeg?auto=compress&w=400',
  parsley:          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  dill:             'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400&q=80',
  mint:             'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&q=80',
  pudina:           'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&q=80',
  basil:            'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&q=80',
  lemongrass:       'https://images.unsplash.com/photo-1587385789097-0197a7fbd179?w=400&q=80',
  celery:           'https://images.unsplash.com/photo-1616362260507-c6c25ce85a41?w=400&q=80',
  'green onion':    'https://images.unsplash.com/photo-1550082849-b1b1b1b1b1b1?w=400&q=80',
  'spring onion':   'https://images.unsplash.com/photo-1571942676516-bcab84649e44?w=400&q=80',
  'curry leaves':   'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&q=80',

  // ── Root Vegetables ───────────────────────────────────────────────────────
  carrot:           'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80',
  beetroot:         'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=400&q=80',
  'sweet potato':   'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
  potato:           'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
  aloo:             'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
  radish:           'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&q=80',
  turnip:           'https://images.unsplash.com/photo-1601504541019-0e6eaeb7003d?w=400&q=80',
  yam:              'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80',
  senai:            'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80',
  colocasia:        'https://images.unsplash.com/photo-1559181567-c3190ca9be46?w=400&q=80',
  arbi:             'https://images.unsplash.com/photo-1559181567-c3190ca9be46?w=400&q=80',
  taro:             'https://images.unsplash.com/photo-1559181567-c3190ca9be46?w=400&q=80',
  onion:            'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80',
  garlic:           'https://images.unsplash.com/photo-1617694835869-f859f4c9f46c?w=400&q=80',
  ginger:           'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&q=80',
  turmeric:         'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&q=80',

  // ── Gourds & Vegetables ───────────────────────────────────────────────────
  'bitter gourd':   'https://images.unsplash.com/photo-1601926638754-25c0de7da0d0?w=400&q=80',
  karela:           'https://images.unsplash.com/photo-1601926638754-25c0de7da0d0?w=400&q=80',
  'bottle gourd':   'https://images.unsplash.com/photo-1730127487636-b7fe550af030?w=400&q=80',
  'ridge gourd':    'https://images.unsplash.com/photo-1730127487636-b7fe550af030?w=400&q=80',
  'snake gourd':    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  'ash gourd':      'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=400&q=80',
  pumpkin:          'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=400&q=80',
  zucchini:         'https://images.unsplash.com/photo-1587997989565-3d2d35cde3e5?w=400&q=80',
  'lotus stem':     'https://images.unsplash.com/photo-1612207831745-c2aad49b0e90?w=400&q=80',
  lotus:            'https://images.unsplash.com/photo-1612207831745-c2aad49b0e90?w=400&q=80',
  kohlrabi:         'https://images.unsplash.com/photo-1598170841697-0f14f46e53ed?w=400&q=80',
  tomato:           'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
  thakkali:         'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
  'cherry tomato':  'https://images.unsplash.com/photo-1570543375343-63fe3d67761b?w=400&q=80',
  cucumber:         'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&q=80',
  brinjal:          'https://images.unsplash.com/photo-1634200256268-2073c4282c7b?w=400&q=80',
  eggplant:         'https://images.unsplash.com/photo-1634200256268-2073c4282c7b?w=400&q=80',
  okra:             'https://images.unsplash.com/photo-1515543904379-3d757fab7ea1?w=400&q=80',
  'lady':           'https://images.unsplash.com/photo-1515543904379-3d757fab7ea1?w=400&q=80',
  capsicum:         'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80',
  chilli:           'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&q=80',
  broccoli:         'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80',
  cabbage:          'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&q=80',
  cauliflower:      'https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785?w=400&q=80',
  drumstick:        'https://images.unsplash.com/photo-1555443805-658637491dd4?w=400&q=80',
  'sweet corn':     'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80',
  corn:             'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80',
  mushroom:         'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=400&q=80',
  'raw banana':     'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&q=80',

  // ── Beans & Lentils ───────────────────────────────────────────────────────
  'french beans':   'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&q=80',
  'cluster beans':  'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&q=80',
  'broad beans':    'https://images.unsplash.com/photo-1595888234820-bbe52d6ef891?w=400&q=80',
  'hyacinth':       'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&q=80',
  avarakkai:        'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&q=80',
  cowpea:           'https://images.unsplash.com/photo-1595888234820-bbe52d6ef891?w=400&q=80',
  'lima beans':     'https://images.unsplash.com/photo-1595888234820-bbe52d6ef891?w=400&q=80',
  'green peas':     'https://images.unsplash.com/photo-1560912880-c1e14c53ebb4?w=400&q=80',
  peas:             'https://images.unsplash.com/photo-1560912880-c1e14c53ebb4?w=400&q=80',

  // ── Tropical & Everyday Fruits ────────────────────────────────────────────
  mango:            'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80',
  'raw mango':      'https://images.unsplash.com/photo-1591065901572-c2e6413abde7?w=400&q=80',
  banana:           'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80',
  apple:            'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80',
  papaya:           'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=400&q=80',
  pineapple:        'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&q=80',
  watermelon:       'https://images.unsplash.com/photo-1629276301820-0f3eedc29fd0?w=400&q=80',
  muskmelon:        'https://images.unsplash.com/photo-1571022210005-4f83af7b3a4c?w=400&q=80',
  'custard apple':  'https://images.unsplash.com/photo-1588974558793-7ab89c7ef07c?w=400&q=80',
  sitaphal:         'https://images.unsplash.com/photo-1588974558793-7ab89c7ef07c?w=400&q=80',
  sapota:           'https://images.unsplash.com/photo-1567450668-d3c3a2e44c57?w=400&q=80',
  chikoo:           'https://images.unsplash.com/photo-1567450668-d3c3a2e44c57?w=400&q=80',
  jackfruit:        'https://images.unsplash.com/photo-1555279880-f9b2cfe43e2d?w=400&q=80',
  coconut:          'https://images.unsplash.com/photo-1553748022-5d2dd87040f9?w=400&q=80',
  guava:            'https://images.unsplash.com/photo-1530517119038-aab64e28ece0?w=400&q=80',

  // ── Citrus Fruits ─────────────────────────────────────────────────────────
  orange:           'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80',
  mandarin:         'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80',
  grapefruit:       'https://images.unsplash.com/photo-1571104508999-893933ded431?w=400&q=80',
  'sweet lime':     'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&q=80',
  mosambi:          'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&q=80',
  lemon:            'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&q=80',
  lime:             'https://images.unsplash.com/photo-1529399519888-20b03e3b6484?w=400&q=80',

  // ── Berries, Grapes & Special Fruits ─────────────────────────────────────
  grapes:           'https://images.unsplash.com/photo-1423483641154-5411ec9c0ddf?w=400&q=80',
  strawberry:       'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80',
  blueberry:        'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&q=80',
  pomegranate:      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&q=80',
  fig:              'https://images.unsplash.com/photo-1601379327928-bedfaf9da2d0?w=400&q=80',
  anjeer:           'https://images.unsplash.com/photo-1601379327928-bedfaf9da2d0?w=400&q=80',
  kiwi:             'https://images.unsplash.com/photo-1618897996318-5a901fa18eb0?w=400&q=80',
  avocado:          'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80',
  lychee:           'https://images.unsplash.com/photo-1590403081849-bc5cb90b2695?w=400&q=80',
  litchi:           'https://images.unsplash.com/photo-1590403081849-bc5cb90b2695?w=400&q=80',
  longan:           'https://images.unsplash.com/photo-1590403081849-bc5cb90b2695?w=400&q=80',
  rambutan:         'https://images.unsplash.com/photo-1597371284578-a8d3ae4e5f0e?w=400&q=80',
  'passion fruit':  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80',
  passion:          'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80',
  'star fruit':     'https://images.unsplash.com/photo-1620591468693-f81a7da7e175?w=400&q=80',
  'dragon fruit':   'https://images.unsplash.com/photo-1572099606223-6e29045d7de3?w=400&q=80',
  dragon:           'https://images.unsplash.com/photo-1572099606223-6e29045d7de3?w=400&q=80',
  peach:            'https://images.unsplash.com/photo-1595404732649-5d00c77bff27?w=400&q=80',
  plum:             'https://images.unsplash.com/photo-1601004890-db3c400de9ef?w=400&q=80',
  pear:             'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80',
}
const FALLBACK = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80'

// Exported so Cart and other components can resolve the same smart food images
export function resolveProductImage(product) {
  if (!product) return FALLBACK
  if (product.image_url) return product.image_url
  const name = ((product.name || '') + ' ' + (product.tamil_name || '')).toLowerCase()
  for (const [key, url] of Object.entries(FOOD_IMAGES)) {
    if (name.includes(key)) return url
  }
  return FALLBACK
}

// Internal alias kept for backward compat
function resolveImage(product) { return resolveProductImage(product) }

export default function ProductCard({ product }) {
  const navigate  = useNavigate()
  const { items, addItem, updateQuantity } = useCartStore()
  const cartItem  = items.find((i) => i.id === product.id)
  const qty       = cartItem?.quantity || 0
  const isOOS     = product.stock_status === 'out_of_stock'
  const hasOffer  = product.offer_price != null && product.offer_price < product.price
  const discount  = getDiscountPercent(product.price, product.offer_price)
  const price     = hasOffer ? product.offer_price : product.price
  const imgSrc    = resolveImage(product)

  const [pulsing, setPulsing] = useState(false)

  const triggerPulse = () => {
    setPulsing(true)
    setTimeout(() => setPulsing(false), 320)
  }

  const handleAdd = (e) => {
    e.stopPropagation()
    if (isOOS) return
    addItem(product)
    triggerPulse()
    toast.success(`${product.name} added`, { duration: 900, style: { fontSize: 13 } })
  }
  const handleInc = (e) => { e.stopPropagation(); updateQuantity(product.id, qty + 1); triggerPulse() }
  const handleDec = (e) => { e.stopPropagation(); updateQuantity(product.id, qty - 1) }

  return (
    <article
      className="product-card-v2"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* ── Image — compact 140px ── */}
      <div style={{ position: 'relative', height: 140, background: '#f8f6f2', overflow: 'hidden' }}>

        {hasOffer && (
          <div style={{
            position: 'absolute', top: 8, left: 8, zIndex: 10,
            background: '#e53e3e', color: '#fff',
            fontSize: '10px', fontWeight: 800,
            padding: '3px 8px', borderRadius: 99, letterSpacing: '.3px',
          }}>
            -{discount}%
          </div>
        )}
        {!hasOffer && product.offer_label && (
          <div style={{
            position: 'absolute', top: 8, left: 8, zIndex: 10,
            background: '#d97706', color: '#fff',
            fontSize: '9px', fontWeight: 700,
            padding: '3px 8px', borderRadius: 99,
          }}>
            {product.offer_label}
          </div>
        )}
        {product.stock_status === 'limited' && (
          <div style={{
            position: 'absolute', top: 8, right: 8, zIndex: 10,
            background: 'rgba(255,251,235,.95)', color: '#b45309',
            fontSize: '9px', fontWeight: 700,
            padding: '3px 8px', borderRadius: 99,
            border: '1px solid #fde68a',
          }}>
            Few left
          </div>
        )}

        <img
          src={imgSrc}
          alt={product.name}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform .5s cubic-bezier(.22,1,.36,1)',
          }}
          onError={(e) => { e.target.src = FALLBACK }}
          loading="lazy"
          onMouseEnter={(e) => { e.target.style.transform = 'scale(1.07)' }}
          onMouseLeave={(e) => { e.target.style.transform = 'scale(1)' }}
        />

        {isOOS && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(250,248,244,.88)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontSize: '10px', fontWeight: 700, color: 'var(--text-mid)',
              letterSpacing: '.07em', textTransform: 'uppercase',
              background: '#fff', padding: '5px 12px',
              borderRadius: 99, border: '1px solid var(--border)',
            }}>
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '10px 11px 11px' }}>
        <h3 style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12.5px', fontWeight: 600,
          color: 'var(--text-dark)', letterSpacing: '-.01em',
          lineHeight: 1.3, marginBottom: 1,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          margin: '0 0 1px',
        }}>
          {product.name}
        </h3>

        {product.tamil_name && (
          <p style={{ fontSize: '10px', color: 'var(--brand-600)', fontWeight: 500, margin: '0 0 1px' }}>
            {product.tamil_name}
          </p>
        )}

        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 8px' }}>
          {product.unit}
        </p>

        {/* ── Price + cart on ONE row ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ lineHeight: 1 }}>
            <span style={{
              fontSize: '15px', fontWeight: 800,
              color: 'var(--text-dark)', letterSpacing: '-.02em',
            }}>
              {formatPrice(price)}
            </span>
            {hasOffer && (
              <span style={{
                fontSize: '10.5px', color: 'var(--text-light)',
                textDecoration: 'line-through', marginLeft: 5,
              }}>
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {qty === 0 ? (
            <button
              onClick={handleAdd}
              disabled={isOOS}
              className={pulsing ? 'cart-add-pulse' : ''}
              style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                border: isOOS ? 'none' : '1.5px solid var(--brand-500)',
                background: isOOS ? 'var(--warm-100)' : 'transparent',
                color: isOOS ? 'var(--text-light)' : 'var(--brand-700)',
                cursor: isOOS ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .15s, color .15s, border-color .15s',
              }}
              onMouseEnter={(e) => { if (!isOOS) { e.currentTarget.style.background = 'var(--brand-800)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--brand-800)' } }}
              onMouseLeave={(e) => { if (!isOOS) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--brand-700)'; e.currentTarget.style.borderColor = 'var(--brand-500)' } }}
            >
              <Plus size={15} strokeWidth={2.5} />
            </button>
          ) : (
            <div
              className={pulsing ? 'cart-add-pulse' : ''}
              style={{
                display: 'flex', alignItems: 'center', gap: 3,
                background: 'var(--brand-800)',
                borderRadius: 10, padding: '0 5px', height: 34, flexShrink: 0,
              }}
            >
              <button onClick={handleDec} style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation' }}>
                <Minus size={10} strokeWidth={2.8} />
              </button>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '12.5px', fontFamily: 'var(--font-body)', minWidth: 14, textAlign: 'center' }}>
                {qty}
              </span>
              <button onClick={handleInc} style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation' }}>
                <Plus size={10} strokeWidth={2.8} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
