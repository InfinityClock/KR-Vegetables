import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProducts, useCategories } from '../../hooks/useProducts'
import { BANNERS } from '../../data/mockData'
import ProductCard from '../../components/ProductCard'
import { HomeTopBar } from '../../components/TopBar'
import { SkeletonProductGrid } from '../../components/Skeleton'
import WhatsAppButton from '../../components/WhatsAppButton'
import { formatPrice, getDiscountPercent } from '../../utils/format'
import {
  Leaf, Zap, Star, Headphones, ChevronRight, Truck,
  ShieldCheck, Sprout, ArrowRight, Percent, Clock,
} from 'lucide-react'

// ─── Marquee Ticker Strip ──────────────────────────────────────────────────────
const TICKER_ITEMS = [
  '🌿  Farm-fresh daily',
  '🚚  Free delivery above ₹299',
  '⚡  Same-day delivery',
  '✅  100% quality guarantee',
  '🌿  Farm-fresh daily',
  '🚚  Free delivery above ₹299',
  '⚡  Same-day delivery',
  '✅  100% quality guarantee',
]

function MarqueeTicker() {
  return (
    <div
      className="overflow-hidden"
      style={{
        background: 'var(--brand-800)',
        height: 34,
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
              color: 'rgba(255,255,255,.85)',
              letterSpacing: '.04em',
              paddingRight: 48,
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Hero Carousel ─────────────────────────────────────────────────────────────
function HeroCarousel() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % BANNERS.length), 4800)
    return () => clearInterval(timerRef.current)
  }, [])

  return (
    <div
      className="relative overflow-hidden"
      style={{ margin: '0 16px', height: 200, borderRadius: 'var(--radius-lg)', cursor: 'pointer' }}
      onClick={() => navigate('/shop')}
    >
      {BANNERS.map((banner, i) => (
        <div
          key={banner.id}
          className="absolute inset-0"
          style={{
            background: banner.gradient,
            opacity: i === current ? 1 : 0,
            transition: 'opacity .7s ease',
            pointerEvents: i === current ? 'auto' : 'none',
          }}
        >
          {/* Subtle texture overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.08)' }} />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
            <span
              className="label-caps self-start mb-2"
              style={{ color: 'rgba(255,255,255,.65)' }}
            >
              Today's Special
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.65rem',
                fontWeight: 600,
                color: '#fff',
                lineHeight: 1.15,
                letterSpacing: '-.02em',
                marginBottom: 6,
              }}
            >
              {banner.title}
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,.8)', marginBottom: 14 }}>
              {banner.subtitle}
            </p>
            {banner.cta && (
              <div
                className="inline-flex items-center gap-1.5 self-start"
                style={{
                  background: 'rgba(255,255,255,.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 'var(--radius-full)',
                  padding: '5px 14px',
                  color: '#fff',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {banner.cta} <ArrowRight size={12} />
              </div>
            )}
          </div>

          {/* Emoji decoration */}
          <div
            className="absolute"
            style={{
              right: 20, top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 72,
              opacity: .2,
              userSelect: 'none',
            }}
          >
            {banner.emoji}
          </div>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-3 right-4 flex gap-1.5 items-center z-20">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
            style={{
              width: i === current ? 16 : 4,
              height: 4,
              borderRadius: 'var(--radius-full)',
              background: i === current ? '#fff' : 'rgba(255,255,255,.4)',
              transition: 'width .3s, background .3s',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Category Strip ────────────────────────────────────────────────────────────
function CategoryStrip({ categories, loading, onSelect }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)' }} />
            <div className="skeleton" style={{ width: 44, height: 10, borderRadius: 4 }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat)}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 transition-all active:scale-95"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
            }}
          >
            {cat.emoji}
          </div>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              textAlign: 'center',
              maxWidth: 58,
              lineHeight: 1.3,
            }}
          >
            {cat.name}
          </span>
        </button>
      ))}
      <button
        onClick={() => navigate('/shop')}
        className="flex flex-col items-center gap-1.5 flex-shrink-0 transition-all active:scale-95"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)' }}>
          All
        </span>
      </button>
    </div>
  )
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, onSeeAll }) {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-light)', marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="flex items-center gap-1 shrink-0"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--brand-600)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '.02em',
          }}
        >
          See all <ChevronRight size={13} />
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
          <div key={i} className="flex-shrink-0" style={{ width: 148 }}>
            <div className="skeleton rounded-xl mb-2" style={{ height: 140 }} />
            <div className="skeleton mb-1.5" style={{ height: 12, width: '75%', borderRadius: 4 }} />
            <div className="skeleton mb-2" style={{ height: 16, width: '50%', borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 30, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
      {products.map((p) => (
        <div key={p.id} className="flex-shrink-0" style={{ width: 148 }}>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  )
}

// ─── Editorial Promo Cards ─────────────────────────────────────────────────────
function PromoCards({ navigate }) {
  const cards = [
    {
      label: 'FRESH TODAY',
      title: 'Greens & Herbs',
      subtitle: 'Harvested this morning',
      link: '/shop?category=cat-1',
      accent: 'var(--brand-800)',
      bg: 'var(--brand-50)',
    },
    {
      label: 'BEST DEALS',
      title: 'Up to 30% Off',
      subtitle: 'Limited-time prices',
      link: '/shop?sort=offers',
      accent: 'var(--amber-700)',
      bg: 'var(--amber-50)',
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
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 14px',
            cursor: 'pointer',
          }}
        >
          <span className="label-caps block mb-2" style={{ color: c.accent }}>
            {c.label}
          </span>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              fontWeight: 600,
              color: 'var(--text-dark)',
              lineHeight: 1.2,
              letterSpacing: '-.02em',
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
            style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: c.accent }}
          >
            Shop now <ArrowRight size={11} />
          </div>
        </button>
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
      className="flex-shrink-0 cursor-pointer transition-all active:scale-97"
      style={{
        width: 152,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <div className="relative" style={{ height: 110, background: 'var(--warm-50)' }}>
        <span
          className="absolute top-2 left-2 z-10"
          style={{
            background: 'var(--brand-800)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontSize: '9px',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 'var(--radius-xs)',
            letterSpacing: '.4px',
            textTransform: 'uppercase',
          }}
        >
          −{discount}%
        </span>
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.opacity = 0 }}
          loading="lazy"
        />
      </div>
      <div style={{ padding: '10px 12px' }}>
        <p
          className="line-clamp-1"
          style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4 }}
        >
          {product.name}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, color: 'var(--text-dark)' }}>
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

// ─── Why KR Section ────────────────────────────────────────────────────────────
const WHY_KR = [
  { icon: Sprout,      title: 'Farm Fresh',   desc: 'Sourced daily from local farms' },
  { icon: Clock,       title: 'Same-Day',     desc: 'Order before 12pm, get today' },
  { icon: ShieldCheck, title: 'Guaranteed',   desc: 'Full refund if not satisfied' },
  { icon: Headphones,  title: '24/7 Support', desc: 'Always here to help you' },
]

function WhyKR() {
  return (
    <div className="mx-4" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '16px 20px' }}>
        <span className="label-caps">The KR Promise</span>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--text-dark)',
            letterSpacing: '-.02em',
            marginTop: 4,
            lineHeight: 1.2,
          }}
        >
          Why families choose us
        </h3>
      </div>
      <div className="grid grid-cols-2">
        {WHY_KR.map(({ icon: Icon, title, desc }, i) => (
          <div
            key={i}
            style={{
              padding: '16px 18px',
              borderTop: i >= 2 ? '1px solid var(--border-light)' : 'none',
              borderLeft: i % 2 !== 0 ? '1px solid var(--border-light)' : 'none',
              background: 'var(--bg-card)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--brand-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <Icon size={18} style={{ color: 'var(--brand-700)' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: 2 }}>
              {title}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
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
      className="hidden lg:block mx-6 mb-6 relative overflow-hidden"
      style={{
        background: 'var(--brand-800)',
        borderRadius: 'var(--radius-xl)',
        padding: '52px 64px',
        minHeight: 320,
      }}
    >
      {/* Subtle tonal background pattern */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 80% at 85% 50%, rgba(23,112,106,.35) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 560 }}>
        <span className="label-caps" style={{ color: 'rgba(255,255,255,.55)' }}>
          Farm to Doorstep · Tamil Nadu
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
            fontWeight: 600,
            color: '#fff',
            letterSpacing: '-.03em',
            lineHeight: 1.1,
            margin: '16px 0 20px',
          }}
        >
          Fresh Vegetables,<br />
          <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Delivered Today</em>
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            color: 'rgba(255,255,255,.7)',
            lineHeight: 1.65,
            marginBottom: 32,
            maxWidth: 440,
          }}
        >
          Handpicked daily from local farms. Same-day delivery to your door.
          Free on orders above ₹299.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-2 transition-all active:scale-95"
            style={{
              background: '#fff',
              color: 'var(--brand-800)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 700,
              padding: '12px 24px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '.01em',
            }}
          >
            Shop Now <ArrowRight size={15} />
          </button>
          <button
            onClick={() => navigate('/shop?sort=offers')}
            className="flex items-center gap-2 transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,.12)',
              color: '#fff',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 600,
              padding: '12px 24px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255,255,255,.2)',
              cursor: 'pointer',
            }}
          >
            <Percent size={14} /> Today's Deals
          </button>
        </div>
      </div>

      {/* Large decorative text */}
      <div
        style={{
          position: 'absolute', right: 64, top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: 'var(--font-display)',
          fontSize: 200,
          lineHeight: 1,
          color: 'rgba(255,255,255,.04)',
          userSelect: 'none',
          letterSpacing: '-.04em',
          pointerEvents: 'none',
        }}
      >
        KR
      </div>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate()

  const { categories, loading: catLoading } = useCategories()
  const { products: featuredProducts, loading: featuredLoading } = useProducts({ is_featured: true, limit: 10 })
  const { products: allProducts, loading: allLoading } = useProducts({ limit: 20 })
  const dealProducts = allProducts.filter((p) => p.offer_price && p.offer_price < p.price)

  return (
    <div className="pb-nav page-enter" style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>
      {/* Mobile TopBar */}
      <HomeTopBar onSearchClick={() => navigate('/shop')} />

      {/* Marquee ticker (mobile) */}
      <div className="lg:hidden">
        <MarqueeTicker />
      </div>

      {/* Desktop greeting */}
      <div className="hidden lg:flex items-center justify-between px-8 pt-8 pb-4">
        <div>
          <span className="label-caps">Welcome back</span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 600,
              color: 'var(--text-dark)',
              letterSpacing: '-.03em',
              lineHeight: 1.2,
              marginTop: 4,
            }}
          >
            What would you like today?
          </h1>
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          Browse All <ArrowRight size={14} />
        </button>
      </div>

      {/* ─── Desktop layout ─── */}
      <div className="hidden lg:block">
        <DesktopHero navigate={navigate} />

        <div className="px-6 grid grid-cols-[260px_1fr] gap-6 items-start">
          {/* Left: Categories sidebar */}
          <div
            className="sticky"
            style={{
              top: 24,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)' }}>
              <span className="label-caps">Categories</span>
            </div>
            <div className="flex flex-col" style={{ padding: '6px 8px' }}>
              <button
                onClick={() => navigate('/shop')}
                className="flex items-center gap-3 transition-all"
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--brand-700)',
                  background: 'var(--brand-50)',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: 2,
                }}
              >
                <span style={{ fontSize: 18 }}>🛒</span> All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/shop?category=${cat.id}`)}
                  className="flex items-center gap-3 transition-all"
                  style={{
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: 'var(--text-mid)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{cat.emoji}</span> {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right: main content */}
          <div className="flex flex-col gap-8">
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
                        <div className="skeleton rounded-xl mb-2" style={{ height: 156 }} />
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
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
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
                  title="Best Sellers"
                  subtitle="Most-loved by our customers"
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
        <div className="px-6 py-8 mt-2">
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-card)' }}>
            <div style={{ padding: '28px 40px', borderBottom: '1px solid var(--border-light)' }}>
              <span className="label-caps">The KR Promise</span>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.85rem',
                  fontWeight: 600,
                  color: 'var(--text-dark)',
                  letterSpacing: '-.03em',
                  marginTop: 6,
                }}
              >
                Why 10,000+ families choose us
              </h2>
            </div>
            <div className="grid grid-cols-4">
              {WHY_KR.map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={i}
                  style={{
                    padding: '28px 32px',
                    borderLeft: i > 0 ? '1px solid var(--border-light)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--brand-50)',
                      border: '1px solid var(--brand-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 14,
                    }}
                  >
                    <Icon size={22} style={{ color: 'var(--brand-700)' }} />
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4 }}>
                    {title}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile layout ─── */}
      <div className="lg:hidden flex flex-col gap-6 pt-3 pb-2">
        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Quick Categories */}
        <div>
          <SectionHeader title="Browse by Category" onSeeAll={() => navigate('/shop')} />
          <CategoryStrip
            categories={categories}
            loading={catLoading}
            onSelect={(cat) => navigate(`/shop?category=${cat.id}`)}
          />
        </div>

        {/* Editorial promo cards */}
        <PromoCards navigate={navigate} />

        {/* Featured picks */}
        <div>
          <SectionHeader
            title="Today's Fresh Picks"
            subtitle="Harvested this morning"
            onSeeAll={() => navigate('/shop')}
          />
          <ProductRow products={featuredProducts} loading={featuredLoading} />
        </div>

        {/* Deals row */}
        {dealProducts.length > 0 && (
          <div>
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

        {/* Best sellers grid */}
        {!allLoading && allProducts.length > 0 && (
          <div>
            <SectionHeader
              title="Best Sellers"
              onSeeAll={() => navigate('/shop')}
            />
            <div className="px-4 grid grid-cols-2 gap-3">
              {allProducts.slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
        {allLoading && (
          <div className="px-4">
            <SkeletonProductGrid count={6} />
          </div>
        )}

        {/* Why KR */}
        <WhyKR />

        <div style={{ height: 8 }} />
      </div>

      <WhatsAppButton />
    </div>
  )
}
