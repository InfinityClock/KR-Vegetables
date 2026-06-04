import { useSeo } from '../../hooks/useSeo'
import { useState, useEffect, useRef } from 'react'
// i18n imported by QuickCategories and DeliveryPromise via inline Tamil strings
import { supabase } from '../../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { useProducts, useCategories } from '../../hooks/useProducts'
import { BANNERS } from '../../data/mockData'
import ProductCard from '../../components/ProductCard'
import { HomeTopBar } from '../../components/TopBar'
import { SkeletonProductGrid } from '../../components/Skeleton'
import WhatsAppButton from '../../components/WhatsAppButton'
import { formatPrice, getDiscountPercent } from '../../utils/format'
import {
  Leaf, Zap, Star, Headphones, ChevronRight, Truck,
  ShieldCheck, Sprout, ArrowRight, Percent, Clock, MapPin, Phone, RotateCcw, Plus, Check, Bell,
} from 'lucide-react'
import { STORE_ADDRESS, STORE_MAPS_URL, WHATSAPP_NUMBER, STORE_PHONE, ADMIN_EMAIL, PLACEHOLDER_IMAGE } from '../../constants'
import { sortByStock } from '../../utils/sort'
import { useRecentOrdersStore } from '../../store/recentOrdersStore'
import { useCartStore } from '../../store/cartStore'
import { useSettingsStore } from '../../store/settingsStore'
import { usePushNotifications } from '../../hooks/usePushNotifications'

// ─── Marquee Ticker Strip ──────────────────────────────────────────────────────
const TICKER_ITEMS = [
  '🌿  Farm-fresh daily',
  '🚚  Free delivery on every order',
  '🕐  Two delivery windows daily',
  '✅  Quality checked every order',
  '🌿  Farm-fresh daily',
  '🚚  Free delivery on every order',
  '🕐  Two delivery windows daily',
  '✅  Quality checked every order',
]

function MarqueeTicker() {
  return (
    <div
      className="overflow-hidden"
      style={{
        background: 'var(--brand-800)',
        height: 36,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div className="marquee-track">
        {TICKER_ITEMS.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 500,
              color: 'rgba(255,255,255,.8)',
              letterSpacing: '.05em',
              paddingRight: 52,
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Delivery Promise Strip ─────────────────────────────────────────────────────
// Quick-commerce urgency bar — shows delivery windows + free delivery.
// Appears just below the hero on mobile, and below the heading on desktop.
function DeliveryPromise() {
  const promises = [
    { icon: '🚚', text: 'Free delivery',     textTa: 'இலவச டெலிவரி' },
    { icon: '⏰', text: '8AM–1PM · 3PM–8PM', textTa: 'இரண்டு நேர சாளரங்கள்' },
    { icon: '🌿', text: 'Farm fresh daily',  textTa: 'தினமும் புதியவை' },
  ]
  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        overflowX: 'auto',
        background: 'var(--brand-50)',
        borderTop: '1px solid var(--brand-100)',
        borderBottom: '1px solid var(--brand-100)',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {promises.map((p, i) => (
        <div
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px',
            flexShrink: 0,
            borderRight: i < promises.length - 1 ? '1px solid var(--brand-100)' : 'none',
          }}
        >
          <span style={{ fontSize: 14 }}>{p.icon}</span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '11.5px',
              fontWeight: 600, color: 'var(--brand-800)',
              whiteSpace: 'nowrap', lineHeight: 1.3,
            }}>
              {p.text}
            </span>
            {p.textTa && (
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '9.5px',
                color: 'var(--brand-700)', opacity: 0.7,
                whiteSpace: 'nowrap', lineHeight: 1.2,
              }}>
                {p.textTa}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Hero Carousel ─────────────────────────────────────────────────────────────
function HeroCarousel() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)
  const [dbBanners, setDbBanners] = useState([])

  // Load active banners from DB; fall back to static BANNERS if none configured
  useEffect(() => {
    supabase.from('offers_banner').select('*').eq('is_active', true).order('created_at', { ascending: false })
      .then(({ data }) => { if (data?.length) setDbBanners(data) })
  }, [])

  const activeBanners = dbBanners.length > 0
    ? dbBanners.map((b) => ({ ...b, gradient: b.bg_color, cta: 'Shop Now', ctaPath: '/shop', emoji: '🥦🥕🍅' }))
    : BANNERS

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % activeBanners.length), 4800)
    return () => clearInterval(timerRef.current)
  }, [activeBanners.length])

  return (
    <div
      className="relative overflow-hidden cursor-pointer"
      style={{ height: 272 }}
      onClick={() => navigate('/shop')}
    >
      {activeBanners.map((banner, i) => (
        <div
          key={banner.id}
          className="absolute inset-0"
          style={{
            background: banner.gradient,
            opacity: i === current ? 1 : 0,
            transition: 'opacity .75s ease',
            pointerEvents: i === current ? 'auto' : 'none',
          }}
        >
          {/* Radial light overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 80% at 15% 50%, rgba(255,255,255,.06) 0%, transparent 65%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.45) 0%, transparent 55%)' }} />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end z-10" style={{ padding: '0 22px 26px' }}>
            <span
              style={{
                display: 'inline-block', alignSelf: 'flex-start',
                fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600,
                letterSpacing: '.04em',
                color: 'rgba(255,255,255,.65)',
                background: 'rgba(255,255,255,.12)',
                backdropFilter: 'blur(8px)',
                borderRadius: 99, padding: '4px 10px',
                marginBottom: 10,
              }}
            >
              Today's Special
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                fontWeight: 600,
                color: '#fff',
                lineHeight: 1.1,
                letterSpacing: '-.03em',
                marginBottom: 7,
              }}
            >
              {banner.title}
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'rgba(255,255,255,.75)', marginBottom: 16 }}>
              {banner.subtitle}
            </p>
            {banner.cta && (
              <div
                className="inline-flex items-center gap-1.5 self-start"
                style={{
                  background: '#fff',
                  borderRadius: 99,
                  padding: '7px 18px',
                  color: 'var(--brand-800)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12.5px',
                  fontWeight: 700,
                }}
              >
                {banner.cta} <ArrowRight size={13} />
              </div>
            )}
          </div>

          {/* Large emoji decoration */}
          <div
            style={{
              position: 'absolute', right: 24, top: '50%',
              transform: 'translateY(-55%)',
              fontSize: 90,
              opacity: .18,
              userSelect: 'none',
              filter: 'blur(1px)',
            }}
          >
            {banner.emoji}
          </div>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-4 right-5 flex gap-1.5 items-center z-20">
        {activeBanners.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
            style={{
              width: i === current ? 18 : 5,
              height: 5,
              borderRadius: 99,
              background: i === current ? '#fff' : 'rgba(255,255,255,.4)',
              transition: 'width .3s, background .3s',
              border: 'none', cursor: 'pointer', padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Category Strip ────────────────────────────────────────────────────────────
// Assign a pastel bg per category index
const CAT_PALETTES = [
  { bg: '#e8f5e9', border: '#c8e6c9' },
  { bg: '#fff3e0', border: '#ffe0b2' },
  { bg: '#fce4ec', border: '#f8bbd0' },
  { bg: '#e3f2fd', border: '#bbdefb' },
  { bg: '#f3e5f5', border: '#e1bee7' },
  { bg: '#e0f7fa', border: '#b2ebf2' },
  { bg: '#fff9c4', border: '#fff176' },
  { bg: '#e8f5e9', border: '#c8e6c9' },
]

function CategoryStrip({ categories, loading, onSelect }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide pb-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="skeleton" style={{ width: 62, height: 62, borderRadius: '50%' }} />
            <div className="skeleton" style={{ width: 48, height: 10, borderRadius: 4 }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="scroll-fade">
    <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide pb-1">
      {categories.map((cat, idx) => {
        const pal = CAT_PALETTES[idx % CAT_PALETTES.length]
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat)}
            className="flex flex-col items-center gap-2 flex-shrink-0 transition-all active:scale-90"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div
              style={{
                width: 62, height: 62, borderRadius: '50%',
                background: pal.bg,
                border: `1.5px solid ${pal.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26,
                transition: 'transform .18s, box-shadow .18s',
                boxShadow: '0 2px 8px rgba(0,0,0,.06)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.12)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.06)' }}
            >
              {cat.emoji}
            </div>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10.5px',
                fontWeight: 500,
                color: 'var(--text-mid)',
                textAlign: 'center',
                maxWidth: 66,
                lineHeight: 1.3,
              }}
            >
              {cat.name}
            </span>
          </button>
        )
      })}
      <button
        onClick={() => navigate('/shop')}
        className="flex flex-col items-center gap-2 flex-shrink-0 transition-all active:scale-90"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <div
          style={{
            width: 62, height: 62, borderRadius: '50%',
            background: 'var(--warm-100)',
            border: '1.5px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,.06)',
          }}
        >
          <ChevronRight size={22} style={{ color: 'var(--text-muted)' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', fontWeight: 500, color: 'var(--text-muted)' }}>
          All
        </span>
      </button>
    </div>
    </div>
  )
}

// ─── Quick Categories — bilingual 4-tile grid ─────────────────────────────────
// Customer-facing: All / Vegetables / Fruits / Offers.
// Each tile shows English label + Tamil name + Tamil description.
// The 14 subcategories are preserved in the DB for admin/inventory use.
function QuickCategories({ loading }) {
  const navigate = useNavigate()

  const tiles = [
    {
      key:     'vegetable',
      label:   'Vegetables',
      labelTa: 'காய்கறிகள்',
      emoji:   '🥬',
      desc:    'Leafy greens, gourds, roots & more',
      descTa:  'கீரை, காய்கறி, கிழங்கு',
      bg:      'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
      border:  '#6ee7b7',
      color:   '#065f46',
    },
    {
      key:     'fruit',
      label:   'Fruits',
      labelTa: 'பழங்கள்',
      emoji:   '🍎',
      desc:    'Tropical, citrus, seasonal & more',
      descTa:  'வெப்பமண்டல, சிட்ரஸ், பருவகால',
      bg:      'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      border:  '#fbbf24',
      color:   '#78350f',
    },
    {
      key:     'offers',
      label:   'Offers',
      labelTa: 'சலுகைகள்',
      emoji:   '🏷️',
      desc:    "Today's discounted picks",
      descTa:  'இன்றைய சலுகை விலைகள்',
      bg:      'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
      border:  '#f87171',
      color:   '#7f1d1d',
    },
    {
      key:     'all',
      label:   'All Products',
      labelTa: 'அனைத்தும்',
      emoji:   '🌾',
      desc:    'Browse the full catalogue',
      descTa:  'முழு தயாரிப்பு பட்டியல்',
      bg:      'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
      border:  '#a78bfa',
      color:   '#4c1d95',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 px-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="skeleton rounded-2xl" style={{ height: 96 }} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {tiles.map((tile) => (
        <button
          key={tile.key}
          onClick={() => navigate(tile.key === 'all' ? '/shop' : `/shop?type=${tile.key}`)}
          className="flex items-center gap-3 rounded-2xl p-3.5 text-left transition-all active:scale-97"
          style={{
            background: tile.bg,
            border: `1.5px solid ${tile.border}`,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,.06)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.1)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.06)' }}
        >
          <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{tile.emoji}</span>
          <div className="min-w-0">
            {/* English label */}
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700,
              color: tile.color, margin: 0, lineHeight: 1.2,
            }}>
              {tile.label}
            </p>
            {/* Tamil label — prominent, readable */}
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
              color: tile.color, opacity: 0.8, margin: '1px 0 2px', lineHeight: 1.3,
            }}>
              {tile.labelTa}
            </p>
            {/* Tamil description — very small, muted */}
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '9.5px',
              color: tile.color, opacity: 0.55, margin: 0, lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {tile.descTa}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, onSeeAll }) {
  return (
    <div className="flex items-center justify-between px-4 mb-3" style={{ minHeight: 32 }}>
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',   /* 20px — right-sized for mobile, was 1.75rem */
            fontWeight: 700,
            color: 'var(--text-dark)',
            letterSpacing: '-.02em',
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-light)', marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>
      {onSeeAll && (
        /* Touch target min 44px height for accessibility */
        <button
          onClick={onSeeAll}
          className="flex items-center gap-1 shrink-0"
          style={{
            fontFamily: 'var(--font-body)', fontSize: '12.5px', fontWeight: 600,
            color: 'var(--brand-600)', background: 'none', border: 'none',
            cursor: 'pointer', padding: '8px 4px', minHeight: 44,
          }}
        >
          See all <ChevronRight size={14} />
        </button>
      )}
    </div>
  )
}

// ─── Horizontal Product Row ────────────────────────────────────────────────────
function ProductRow({ products, loading }) {
  if (loading) {
    return (
      <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0" style={{ width: 152 }}>
            <div className="skeleton mb-2" style={{ height: 148, borderRadius: 16 }} />
            <div className="skeleton mb-1.5" style={{ height: 12, width: '75%', borderRadius: 4 }} />
            <div className="skeleton mb-2" style={{ height: 16, width: '50%', borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 32, borderRadius: 10 }} />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
      {products.map((p) => (
        <div key={p.id} className="flex-shrink-0" style={{ width: 152 }}>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  )
}

// ─── Deal Card ─────────────────────────────────────────────────────────────────
function DealCard({ product }) {
  const navigate = useNavigate()
  const discount = getDiscountPercent(product.price, product.offer_price)

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="flex-shrink-0 cursor-pointer"
      style={{
        width: 152,
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(28,26,23,.07)',
        transition: 'transform .18s, box-shadow .18s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(28,26,23,.13)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(28,26,23,.07)' }}
    >
      <div className="relative" style={{ height: 114, background: 'var(--warm-50)' }}>
        <span
          className="absolute top-2.5 left-2.5 z-10"
          style={{
            background: '#e53e3e', color: '#fff',
            fontSize: '10px', fontWeight: 800,
            padding: '3px 9px', borderRadius: 99,
          }}
        >
          -{discount}%
        </span>
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.opacity = 0 }}
          loading="lazy"
        />
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <p
          className="line-clamp-1"
          style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: 5 }}
        >
          {product.name}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-.02em' }}>
            {formatPrice(product.offer_price)}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-light)', textDecoration: 'line-through' }}>
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Editorial Promo Cards ─────────────────────────────────────────────────────
// ─── Order Again ──────────────────────────────────────────────────────────────
function OrderAgainItem({ item }) {
  const addItem = useCartStore((s) => s.addItem)
  const cartItems = useCartStore((s) => s.items)
  const [added, setAdded] = useState(false)

  const inCart = cartItems.some((i) => i.id === item.id)

  const handleAdd = () => {
    addItem(item)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div
      style={{
        flexShrink: 0,
        width: 130,
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border-light)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div style={{ width: '100%', height: 90, overflow: 'hidden', flexShrink: 0, background: 'var(--warm-50)' }}>
        <img
          src={item.image_url || PLACEHOLDER_IMAGE}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div style={{ padding: '8px 10px 10px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <p
          style={{
            fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
            color: 'var(--text-dark)', margin: 0, lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}
        >
          {item.name}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
          {formatPrice(item.price)} / {item.unit}
        </p>

        {/* Add button */}
        <button
          onClick={handleAdd}
          style={{
            marginTop: 'auto',
            paddingTop: 6,
            width: '100%',
            height: 30,
            borderRadius: 8,
            border: 'none',
            background: added || inCart ? 'var(--brand-600)' : 'var(--brand-50)',
            color: added || inCart ? '#fff' : 'var(--brand-700)',
            fontFamily: 'var(--font-body)',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            transition: 'background .2s, color .2s',
          }}
        >
          {added || inCart
            ? <><Check size={12} /> Added</>
            : <><Plus size={12} /> Add</>
          }
        </button>
      </div>
    </div>
  )
}

// ─── Soft push-notification banner ───────────────────────────────────────────
// Shows once per session to customers who haven't enabled notifications yet.
// Dismissing it sets sessionStorage so it doesn't reappear this visit.
function NotificationBanner() {
  const { isSupported, permission, isSubscribed, loading, subscribe } = usePushNotifications()
  const [visible, setVisible] = useState(false)
  const [done, setDone]       = useState(false)

  useEffect(() => {
    if (!isSupported) return
    if (isSubscribed) return
    if (permission === 'denied') return
    if (sessionStorage.getItem('push-banner-dismissed')) return
    // Show after a short delay so it doesn't flash immediately on load
    const t = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(t)
  }, [isSupported, isSubscribed, permission])

  if (!visible || done) return null

  function dismiss() {
    sessionStorage.setItem('push-banner-dismissed', '1')
    setVisible(false)
  }

  return (
    <div
      style={{
        margin: '0 16px 12px',
        background: 'linear-gradient(135deg, var(--brand-800) 0%, var(--teal-800, #115e59) 100%)',
        borderRadius: 14,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Bell size={17} style={{ color: '#fff' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: '#fff', margin: '0 0 1px' }}>
          Get delivery alerts
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', color: 'rgba(255,255,255,.7)', margin: 0 }}>
          Know when your order ships
        </p>
      </div>
      <button
        disabled={loading}
        onClick={async () => {
          const result = await subscribe(null)
          if (result.ok || result.reason === 'denied') {
            setDone(true)
            dismiss()
          }
        }}
        style={{
          padding: '7px 14px',
          background: 'rgba(255,255,255,.18)',
          border: '1px solid rgba(255,255,255,.3)',
          borderRadius: 8,
          fontFamily: 'var(--font-body)', fontSize: '12.5px', fontWeight: 700,
          color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        {loading ? '…' : 'Enable'}
      </button>
      <button
        onClick={dismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.5)', fontSize: 18, lineHeight: 1, padding: '0 0 0 4px', flexShrink: 0 }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}

function OrderAgain() {
  const items = useRecentOrdersStore((s) => s.items)
  if (!items.length) return null

  return (
    <div>
      <div className="px-4 flex items-center justify-between mb-3">
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <RotateCcw size={15} style={{ color: 'var(--brand-600)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', letterSpacing: '-.02em' }}>
            Order Again
          </span>
        </div>
      </div>
      <div
        className="px-4"
        style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}
      >
        {items.map((item) => (
          <OrderAgainItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

// ─── Promo Cards ───────────────────────────────────────────────────────────────
function PromoCards({ navigate }) {
  const { categories } = useCategories()

  // Find the first greens/herbs/leafy category dynamically by name keyword
  const greensCat = categories.find((c) =>
    /green|leafy|herb|keerai|vegetable/i.test(c.name)
  )
  const greensLink = greensCat
    ? `/shop?category=${greensCat.id}`
    : '/shop'

  const cards = [
    {
      label: 'FRESH TODAY',
      title: 'Greens & Herbs',
      subtitle: 'Harvested this morning',
      link: greensLink,
      accent: 'var(--brand-700)',
      bg: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8f3 100%)',
      border: 'var(--brand-100)',
      emoji: '🥬',
    },
    {
      label: 'BEST DEALS',
      title: 'Up to 30% Off',
      subtitle: 'Limited-time prices',
      link: '/shop?sort=offers',
      accent: 'var(--amber-700)',
      bg: 'linear-gradient(135deg, #fff8e6 0%, #fffbf0 100%)',
      border: '#fde68a',
      emoji: '🏷️',
    },
  ]

  return (
    <div className="px-4 grid grid-cols-2 gap-3">
      {cards.map((c, i) => (
        <button
          key={i}
          onClick={() => navigate(c.link)}
          className="text-left transition-all active:scale-96"
          style={{
            background: c.bg,
            border: `1.5px solid ${c.border}`,
            borderRadius: 18,
            padding: '18px 16px',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-body)', fontSize: '9.5px',
              fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
              color: c.accent, marginBottom: 8,
            }}
          >
            {c.label}
          </span>
          <div style={{ fontSize: 32, marginBottom: 6 }}>{c.emoji}</div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem', fontWeight: 600,
              color: 'var(--text-dark)',
              lineHeight: 1.2, letterSpacing: '-.02em',
              marginBottom: 4,
            }}
          >
            {c.title}
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>
            {c.subtitle}
          </p>
          <div
            className="flex items-center gap-1 mt-3"
            style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', fontWeight: 700, color: c.accent }}
          >
            Shop now <ArrowRight size={11} />
          </div>
        </button>
      ))}
    </div>
  )
}

// ─── Why KR Section ────────────────────────────────────────────────────────────
const WHY_KR = [
  { icon: Sprout,      title: 'Farm Fresh',      desc: 'Sourced daily from local farms',      bg: '#e8f5e9', color: 'var(--brand-700)' },
  { icon: Clock,       title: 'Two Daily Slots', desc: '8AM–1PM & 3PM–8PM delivery windows', bg: '#e3f2fd', color: '#1565C0' },
  { icon: ShieldCheck, title: 'Quality Promise', desc: 'Bad item? We replace it, free',       bg: '#f3e5f5', color: '#7B1FA2' },
  { icon: Headphones,  title: 'WhatsApp Support', desc: 'Message us on WhatsApp for help',    bg: '#fff8e6', color: 'var(--amber-700)' },
]

function WhyKR() {
  return (
    <div className="mx-4" style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 16px rgba(28,26,23,.08)', background: '#fff' }}>
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border-light)' }}>
        <span
          style={{
            display: 'inline-block', fontFamily: 'var(--font-body)', fontSize: '10px',
            fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
            color: 'var(--brand-600)', background: 'var(--brand-50)',
            padding: '3px 10px', borderRadius: 99, marginBottom: 8,
          }}
        >
          The KR Promise
        </span>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem', fontWeight: 600,
            color: 'var(--text-dark)', letterSpacing: '-.025em',
            lineHeight: 1.2,
          }}
        >
          Why families choose us
        </h3>
      </div>
      <div className="grid grid-cols-2">
        {WHY_KR.map(({ icon: Icon, title, desc, bg, color }, i) => (
          <div
            key={i}
            style={{
              padding: '18px 18px',
              borderTop: i >= 2 ? '1px solid var(--border-light)' : 'none',
              borderLeft: i % 2 !== 0 ? '1px solid var(--border-light)' : 'none',
            }}
          >
            <div
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <Icon size={19} style={{ color }} />
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: 3 }}>
              {title}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Desktop Hero ──────────────────────────────────────────────────────────────
function DesktopHero({ navigate }) {
  return (
    <div
      className="hidden lg:block mx-6 mb-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0c1e12 0%, #1b3e2c 50%, #17706a 100%)',
        borderRadius: 24,
        padding: '56px 68px',
        minHeight: 340,
      }}
    >
      {/* Radial glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 70% at 90% 50%, rgba(36,168,158,.22) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 40% 60% at 10% 80%, rgba(255,255,255,.04) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 580 }}>
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)',
            borderRadius: 99, padding: '5px 14px',
            fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
            color: 'rgba(255,255,255,.7)', letterSpacing: '.06em', textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#52d18a', display: 'inline-block' }} />
          Farm to Doorstep · Tamil Nadu
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.6rem, 4.2vw, 3.8rem)',
            fontWeight: 600,
            color: '#fff',
            letterSpacing: '-.03em',
            lineHeight: 1.08,
            marginBottom: 20,
          }}
        >
          Fresh Vegetables,<br />
          <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,.75)' }}>Delivered Today</em>
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            color: 'rgba(255,255,255,.62)',
            lineHeight: 1.7,
            marginBottom: 36,
            maxWidth: 440,
          }}
        >
          Handpicked daily from local farms. Delivered to your door in two
          windows: 8AM–1PM &amp; 3PM–8PM. Always free delivery, no minimum order.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-2 transition-all active:scale-95"
            style={{
              background: '#fff', color: 'var(--brand-800)',
              fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700,
              padding: '13px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
              letterSpacing: '.01em', boxShadow: '0 4px 20px rgba(0,0,0,.2)',
            }}
          >
            Shop Now <ArrowRight size={15} />
          </button>
          <button
            onClick={() => navigate('/shop?sort=offers')}
            className="flex items-center gap-2 transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,.1)', color: '#fff',
              fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
              padding: '13px 28px', borderRadius: 12,
              border: '1px solid rgba(255,255,255,.2)', cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Percent size={14} /> Today's Deals
          </button>
        </div>
      </div>

      {/* Large decorative text */}
      <div
        style={{
          position: 'absolute', right: 60, top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: 'var(--font-display)',
          fontSize: 210, lineHeight: 1,
          color: 'rgba(255,255,255,.03)',
          userSelect: 'none', letterSpacing: '-.04em', pointerEvents: 'none',
        }}
      >
        KR
      </div>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function Home() {
  useSeo({
    title: 'KR Vegetables & Fruits — Fresh Daily from Local Farms',
    description: 'Order fresh vegetables and fruits online in Chennai. Farm-fresh produce delivered daily. Two delivery windows: 8AM–1PM and 3PM–8PM.',
    noSuffix: true,
  })
  const navigate = useNavigate()

  const { store_open } = useSettingsStore()
  const { categories, loading: catLoading } = useCategories()
  const { products: featuredRaw, loading: featuredLoading } = useProducts({ is_featured: true, limit: 10 })
  const { products: allRaw,      loading: allLoading }      = useProducts({ limit: 20 })

  // Client-side safety net: ensure OOS is always last even if the DB query
  // returns a cached/stale order. sortByStock is O(n) and allocation-cheap.
  const featuredProducts = sortByStock(featuredRaw)
  const allProducts      = sortByStock(allRaw)
  const dealProducts     = allProducts.filter((p) => p.offer_price && p.offer_price < p.price)

  return (
    <div className="pb-nav page-enter" style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>
      {/* Mobile TopBar */}
      <HomeTopBar onSearchClick={() => navigate('/shop')} />

      {/* Ticker (mobile only) */}
      <div className="lg:hidden">
        <MarqueeTicker />
      </div>

      {/* Store closed banner — shown on both mobile and desktop */}
      {store_open === false && (
        <div style={{
          background: '#FEF3C7', borderBottom: '1px solid #FDE68A',
          padding: '10px 20px', textAlign: 'center',
          fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: '#92400E',
        }}>
          🕐 Store is closed right now. We reopen at 8AM. You can browse and your cart is saved.
        </div>
      )}

      {/* Delivery promise strip — desktop only (mobile gets it after hero) */}
      <div className="hidden lg:block">
        <DeliveryPromise />
      </div>

      {/* Desktop greeting */}
      <div className="hidden lg:flex items-center justify-between px-8 pt-8 pb-6">
        <div>
          <span
            style={{
              display: 'inline-block', fontFamily: 'var(--font-body)', fontSize: '10px',
              fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'var(--brand-600)', background: 'var(--brand-50)',
              padding: '3px 10px', borderRadius: 99, marginBottom: 8,
            }}
          >
            Welcome back
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.2rem', fontWeight: 600,
              color: 'var(--text-dark)', letterSpacing: '-.03em',
              lineHeight: 1.15,
            }}
          >
            What would you like today?
          </h1>
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="btn-primary flex items-center gap-2 px-5 py-3 text-sm rounded-xl"
        >
          Browse All <ArrowRight size={14} />
        </button>
      </div>

      {/* ─── Desktop layout ─── */}
      <div className="hidden lg:block">
        <DesktopHero navigate={navigate} />

        <div className="px-6 grid grid-cols-[256px_1fr] gap-6 items-start">
          {/* Left: Categories sidebar */}
          <div
            className="sticky"
            style={{
              top: 24,
              background: '#fff',
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: '0 2px 16px rgba(28,26,23,.08)',
            }}
          >
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)' }}>
              <span
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '10px',
                  fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                Categories
              </span>
            </div>
            <div className="flex flex-col" style={{ padding: '6px 8px' }}>
              <button
                onClick={() => navigate('/shop')}
                className="flex items-center gap-3 transition-all"
                style={{
                  padding: '10px 12px', borderRadius: 10,
                  fontFamily: 'var(--font-body)', fontSize: '13px',
                  fontWeight: 600, color: 'var(--brand-700)',
                  background: 'var(--brand-50)', border: 'none',
                  cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                }}
              >
                <span style={{ fontSize: 18 }}>🛒</span> All Products
              </button>
              {categories.map((cat, idx) => {
                const pal = CAT_PALETTES[idx % CAT_PALETTES.length]
                return (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/shop?category=${cat.id}`)}
                    className="flex items-center gap-3 transition-all"
                    style={{
                      padding: '9px 12px', borderRadius: 10,
                      fontFamily: 'var(--font-body)', fontSize: '13px',
                      fontWeight: 400, color: 'var(--text-mid)',
                      background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = pal.bg; e.currentTarget.style.color = 'var(--text-dark)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-mid)' }}
                  >
                    <span style={{ fontSize: 18 }}>{cat.emoji}</span> {cat.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: main content */}
          <div className="flex flex-col gap-10 pb-10">
            {/* Order Again — desktop */}
            <OrderAgain />

            {/* Featured picks */}
            <div>
              <SectionHeader
                title="Today's Fresh Picks"
                subtitle="Handpicked from local farms this morning"
                onSeeAll={() => navigate('/shop')}
              />
              <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
                {featuredLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <div key={i}>
                        <div className="skeleton mb-2" style={{ height: 164, borderRadius: 18 }} />
                        <div className="skeleton mb-1" style={{ height: 13, width: '75%', borderRadius: 4 }} />
                        <div className="skeleton" style={{ height: 13, width: '50%', borderRadius: 4 }} />
                      </div>
                    ))
                  : featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)
                }
              </div>
            </div>

            {/* Deals */}
            {dealProducts.length > 0 && (
              <div>
                <SectionHeader
                  title="Deals & Offers"
                  subtitle="Limited-time prices on your favourites"
                  onSeeAll={() => navigate('/shop?sort=offers')}
                />
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {dealProducts.slice(0, 12).map((p) => (
                    <DealCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Best sellers */}
            {!allLoading && allProducts.length > 0 && (
              <div>
                <SectionHeader
                  title="Popular Picks"
                  subtitle="Fresh picks from our store"
                  onSeeAll={() => navigate('/shop')}
                />
                <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
                  {allProducts.slice(0, 8).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Why KR — desktop */}
        <div className="px-6 pb-10 mt-2">
          <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 16px rgba(28,26,23,.08)' }}>
            <div style={{ padding: '32px 44px', borderBottom: '1px solid var(--border-light)' }}>
              <span
                style={{
                  display: 'inline-block', fontFamily: 'var(--font-body)', fontSize: '10px',
                  fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                  color: 'var(--brand-600)', background: 'var(--brand-50)',
                  padding: '3px 10px', borderRadius: 99, marginBottom: 10,
                }}
              >
                The KR Promise
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem', fontWeight: 600,
                  color: 'var(--text-dark)', letterSpacing: '-.03em',
                }}
              >
                Why families choose us
              </h2>
            </div>
            <div className="grid grid-cols-4">
              {WHY_KR.map(({ icon: Icon, title, desc, bg, color }, i) => (
                <div
                  key={i}
                  style={{
                    padding: '30px 34px',
                    borderLeft: i > 0 ? '1px solid var(--border-light)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 14,
                    }}
                  >
                    <Icon size={22} style={{ color }} />
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: 5 }}>
                    {title}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile layout ─── */}
      <div className="lg:hidden flex flex-col gap-0 pt-0 pb-2">
        {/* Hero Carousel — full bleed */}
        <HeroCarousel />

        {/* Delivery promise — quick-commerce urgency strip */}
        <DeliveryPromise />

        {/* Quick Categories */}
        <div style={{ padding: '20px 0 4px' }}>
          <SectionHeader title="Shop by Category" onSeeAll={() => navigate('/shop')} />
          <QuickCategories loading={catLoading} />
        </div>

        {/* ── Featured products grid — immediately visible ── */}
        {/* This mirrors Zepto: products visible without heavy scrolling */}
        <div style={{ padding: '20px 0 4px' }}>
          <SectionHeader
            title="Today's Fresh Picks"
            subtitle="Harvested this morning"
            onSeeAll={() => navigate('/shop')}
          />
          <div className="px-4">
            {featuredLoading ? (
              <SkeletonProductGrid count={6} />
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {featuredProducts.slice(0, 6).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Again — only visible after first order */}
        <div style={{ padding: '4px 0' }}>
          <OrderAgain />
        </div>

        {/* Deals row */}
        {dealProducts.length > 0 && (
          <div style={{ padding: '16px 0 4px' }}>
            <SectionHeader
              title="Deals & Offers"
              onSeeAll={() => navigate('/shop?sort=offers')}
            />
            <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
              {dealProducts.slice(0, 12).map((p) => (
                <DealCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Notification banner */}
        <div style={{ padding: '8px 0' }}>
          <NotificationBanner />
        </div>

        {/* Best sellers grid */}
        <div style={{ padding: '16px 0 4px' }}>
          <SectionHeader title="Best Sellers" onSeeAll={() => navigate('/shop')} />
          <div className="px-4">
            {allLoading ? (
              <SkeletonProductGrid count={6} />
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {allProducts.slice(0, 6).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editorial promo cards */}
        <div style={{ padding: '16px 0' }}>
          <PromoCards navigate={navigate} />
        </div>

        {/* Why KR */}
        <WhyKR />

        <div style={{ height: 8 }} />
      </div>

      {/* ─── Premium Footer ──────────────────────────────────────────────── */}
      <footer style={{ background: 'var(--brand-900)', marginTop: 8 }}>

        {/* Teal accent line at top */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, var(--teal-700) 0%, var(--brand-600) 50%, var(--teal-700) 100%)' }} />

        {/* ── Main grid: 4 columns on desktop, 2×2 on tablet, 1 on mobile ── */}
        <div style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '52px 28px 44px',
          display: 'grid',
          /* Desktop: [brand] [links] [policies] [contact] */
          gridTemplateColumns: 'minmax(0,1.8fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.5fr)',
          gap: '0 48px',
          alignItems: 'start',
        }}
          className="footer-grid"
        >
          {/* ── Col 1: Brand ── */}
          <div style={{ paddingRight: 8 }}>
            {/* Logo mark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 20 }}>🌿</span>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: '#fff', letterSpacing: '-.02em', lineHeight: 1.2 }}>
                KR Vegetables<br />
                <span style={{ fontWeight: 400, color: 'rgba(255,255,255,.6)' }}>&amp; Fruits</span>
              </span>
            </div>

            {/* Tagline */}
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'rgba(255,255,255,.5)', lineHeight: 1.75, margin: '0 0 18px', maxWidth: 260 }}>
              Farm-fresh vegetables &amp; fruits delivered daily to your door in Chennai.
            </p>

            {/* Trust pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
              {['🌿 Farm fresh', '🚚 Free delivery', '✅ Quality promise'].map(pill => (
                <span key={pill} style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', fontWeight: 600, color: 'rgba(255,255,255,.6)', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 99, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                  {pill}
                </span>
              ))}
            </div>

            {/* Location */}
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(255,255,255,.28)', margin: 0, lineHeight: 1.5 }}>
              Chennai, Tamil Nadu, India
            </p>
          </div>

          {/* ── Col 2: Quick Links ── */}
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', margin: '0 0 16px' }}>
              Quick Links
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[
                { to: '/',        label: 'Home' },
                { to: '/shop',    label: 'Shop' },
                { to: '/orders',  label: 'My Orders' },
                { to: '/orders',  label: 'Track Order' },
                { to: '/contact', label: 'Contact Us' },
              ].map(({ to, label }) => (
                <Link
                  key={label}
                  to={to}
                  style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,.52)', textDecoration: 'none', transition: 'color .15s', display: 'inline-block' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,.88)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.52)' }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Col 3: Policies ── */}
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', margin: '0 0 16px' }}>
              Policies
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[
                { to: '/terms',           label: 'Terms of Service' },
                { to: '/privacy-policy',  label: 'Privacy Policy' },
                { to: '/refund-policy',   label: 'Refund Policy' },
                { to: '/shipping-policy', label: 'Shipping Policy' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,.52)', textDecoration: 'none', transition: 'color .15s', display: 'inline-block' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,.88)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.52)' }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Col 4: Contact & Hours ── */}
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', margin: '0 0 16px' }}>
              Contact &amp; Hours
            </p>

            {/* Contact links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <a href={`tel:${STORE_PHONE.replace(/\s/g, '')}`}
                style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, transition: 'opacity .15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '.75' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>📞</span>
                {STORE_PHONE}
              </a>

              {WHATSAPP_NUMBER && (
                <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
                  target="_blank" rel="noreferrer"
                  style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#4ADE80', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, transition: 'opacity .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '.75' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(74,222,128,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>💬</span>
                  WhatsApp
                </a>
              )}

              <a href={`mailto:${ADMIN_EMAIL}`}
                style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,.52)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, transition: 'opacity .15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '.75' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>✉️</span>
                {ADMIN_EMAIL}
              </a>

              <a href={STORE_MAPS_URL} target="_blank" rel="noreferrer"
                style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,.45)', textDecoration: 'none', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.55, transition: 'opacity .15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '.75' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, marginTop: 1 }}>📍</span>
                <span>{STORE_ADDRESS}</span>
              </a>
            </div>

            {/* Delivery hours */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 16 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', margin: '0 0 10px' }}>
                Delivery Windows
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { slot: 'Morning',   time: '8:00 AM – 1:00 PM' },
                  { slot: 'Afternoon', time: '3:00 PM – 8:00 PM' },
                ].map(({ slot, time }) => (
                  <div key={slot} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,.42)' }}>{slot}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,.65)' }}>{time}</span>
                  </div>
                ))}
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', color: 'rgba(255,255,255,.25)', margin: '4px 0 0' }}>
                  Every day · Free delivery
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', padding: '16px 28px' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', color: 'rgba(255,255,255,.28)', margin: 0 }}>
              © {new Date().getFullYear()} KR Vegetables &amp; Fruits. All rights reserved.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', color: 'rgba(255,255,255,.4)', margin: 0 }}>
              Made with 🌿 in Chennai
            </p>
          </div>
        </div>

        {/* Responsive footer styles */}
        <style>{`
          /* Tablet: 2×2 grid */
          @media (max-width: 900px) {
            .footer-grid {
              grid-template-columns: 1fr 1fr !important;
              gap: 36px 32px !important;
            }
          }
          /* Mobile: single column */
          @media (max-width: 560px) {
            .footer-grid {
              grid-template-columns: 1fr !important;
              gap: 32px 0 !important;
            }
          }
        `}</style>

      </footer>

      {/* WhatsApp FAB — positioned above footer on mobile, clear of nav bar */}
      <WhatsAppButton />
    </div>
  )
}
