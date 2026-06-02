import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { formatPrice, getDiscountPercent } from '../utils/format'
import toast from 'react-hot-toast'

// ── Smart image resolution ────────────────────────────────────────────────────
// Maps common produce keywords to high-quality Unsplash/Pexels photos.
// Used only when the product has no image_url set in the DB.
const FOOD_IMAGES = {
  spinach: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
  palak:   'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
  methi:   'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&q=80',
  fenugreek: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&q=80',
  coriander: 'https://images.pexels.com/photos/1435896/pexels-photo-1435896.jpeg?auto=compress&w=400',
  dhania:  'https://images.pexels.com/photos/1435896/pexels-photo-1435896.jpeg?auto=compress&w=400',
  mint:    'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&q=80',
  pudina:  'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&q=80',
  curry:   'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&q=80',
  lemongrass: 'https://images.unsplash.com/photo-1587385789097-0197a7fbd179?w=400&q=80',
  carrot:  'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80',
  beetroot:'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=400&q=80',
  potato:  'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
  aloo:    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
  radish:  'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&q=80',
  onion:   'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80',
  garlic:  'https://images.unsplash.com/photo-1617694835869-f859f4c9f46c?w=400&q=80',
  ginger:  'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&q=80',
  tomato:  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
  thakkali:'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
  cucumber:'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&q=80',
  brinjal: 'https://images.unsplash.com/photo-1634200256268-2073c4282c7b?w=400&q=80',
  eggplant:'https://images.unsplash.com/photo-1634200256268-2073c4282c7b?w=400&q=80',
  okra:    'https://images.unsplash.com/photo-1515543904379-3d757fab7ea1?w=400&q=80',
  capsicum:'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80',
  chilli:  'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&q=80',
  broccoli:'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80',
  cabbage: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&q=80',
  mango:   'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80',
  banana:  'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80',
  apple:   'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80',
  orange:  'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80',
  grapes:  'https://images.unsplash.com/photo-1423483641154-5411ec9c0ddf?w=400&q=80',
  papaya:  'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=400&q=80',
  watermelon: 'https://images.unsplash.com/photo-1629276301820-0f3eedc29fd0?w=400&q=80',
  lemon:   'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&q=80',
  pomegranate: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&q=80',
  guava:   'https://images.unsplash.com/photo-1530517119038-aab64e28ece0?w=400&q=80',
  kiwi:    'https://images.unsplash.com/photo-1618897996318-5a901fa18eb0?w=400&q=80',
  pineapple: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&q=80',
  fig:     'https://images.unsplash.com/photo-1601379327928-bedfaf9da2d0?w=400&q=80',
  anjeer:  'https://images.unsplash.com/photo-1601379327928-bedfaf9da2d0?w=400&q=80',
}
const FALLBACK = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80'

function resolveImage(product) {
  if (product.image_url) return product.image_url
  const name = (product.name + ' ' + (product.tamil_name || '')).toLowerCase()
  for (const [key, url] of Object.entries(FOOD_IMAGES)) {
    if (name.includes(key)) return url
  }
  return FALLBACK
}

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

        <p style={{ fontSize: '10.5px', color: 'var(--text-light)', margin: '0 0 8px' }}>
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
