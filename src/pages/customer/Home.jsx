import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProducts, useCategories } from '../../hooks/useProducts'
import { BANNERS } from '../../data/mockData'
import ProductCard from '../../components/ProductCard'
import { HomeTopBar } from '../../components/TopBar'
import { SkeletonProductGrid } from '../../components/Skeleton'
import WhatsAppButton from '../../components/WhatsAppButton'
import { formatPrice } from '../../utils/format'
import { Leaf, Zap, Star, Headphones, ChevronRight } from 'lucide-react'

// ─── Hero Carousel ────────────────────────────────────────────────────────────
function HeroCarousel() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % BANNERS.length), 4000)
    return () => clearInterval(timerRef.current)
  }, [])

  const b = BANNERS[current]

  return (
    <div className="mx-4">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ height: 176 }}
        onClick={() => navigate('/shop')}
      >
        {BANNERS.map((banner, i) => (
          <div
            key={banner.id}
            className="absolute inset-0 flex flex-col justify-center px-6"
            style={{
              background: banner.gradient,
              opacity: i === current ? 1 : 0,
              transition: 'opacity .6s ease',
              pointerEvents: i === current ? 'auto' : 'none',
            }}
          >
            {/* Decorative circles */}
            <div
              className="absolute right-0 top-0 opacity-10"
              style={{
                width: 160, height: 160,
                borderRadius: '50%',
                background: 'rgba(255,255,255,.4)',
                transform: 'translate(40px,-40px)',
              }}
            />
            <div
              className="absolute right-8 bottom-0 opacity-10"
              style={{
                width: 100, height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,.4)',
                transform: 'translateY(30px)',
              }}
            />

            <div className="text-4xl mb-2">{banner.emoji}</div>
            <h2
              className="text-2xl font-bold text-white leading-tight mb-1"
              style={{ fontFamily: 'Playfair Display, serif', textShadow: '0 1px 4px rgba(0,0,0,.2)' }}
            >
              {banner.title}
            </h2>
            <p className="text-white/90 text-sm">{banner.subtitle}</p>

            {banner.cta && (
              <div
                className="mt-3 inline-flex items-center gap-1 self-start px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(255,255,255,.25)', color: '#fff', backdropFilter: 'blur(8px)' }}
              >
                {banner.cta} <ChevronRight size={12} />
              </div>
            )}
          </div>
        ))}

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 items-center">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
              className={`hero-dot ${i === current ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Category Grid ────────────────────────────────────────────────────────────
function CategoryRow({ categories, loading, onSelect }) {
  if (loading) {
    return (
      <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="skeleton w-[60px] h-[60px] rounded-2xl" />
            <div className="skeleton h-3 w-14 rounded" />
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
          className="cat-card flex-shrink-0"
        >
          <div className="emoji-wrap">
            {cat.emoji}
          </div>
          <span
            className="text-xs font-medium text-center leading-tight"
            style={{ color: 'var(--text-mid)', maxWidth: 64 }}
          >
            {cat.name}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, onSeeAll }) {
  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="flex items-center gap-0.5 text-sm font-semibold"
          style={{ color: 'var(--green-mid)' }}
        >
          See all <ChevronRight size={14} />
        </button>
      )}
    </div>
  )
}

// ─── Horizontal Product Row ───────────────────────────────────────────────────
function ProductRow({ products, loading }) {
  if (loading) {
    return (
      <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[148px]">
            <div className="skeleton rounded-2xl mb-2" style={{ height: 140 }} />
            <div className="skeleton h-3.5 w-3/4 rounded mb-1.5" />
            <div className="skeleton h-5 w-1/2 rounded mb-2" />
            <div className="skeleton h-8 rounded-xl" />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
      {products.map((p) => (
        <div key={p.id} className="flex-shrink-0 w-[148px]">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  )
}

// ─── Deal Card ────────────────────────────────────────────────────────────────
function DealCard({ product }) {
  const navigate = useNavigate()
  const discount = Math.round(((product.price - product.offer_price) / product.price) * 100)

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="flex-shrink-0 w-44 rounded-2xl overflow-hidden cursor-pointer card-hover"
      style={{
        background: 'linear-gradient(150deg, #FFF3E0, #FEFAE0)',
        border: '1.5px solid #FDDCB5',
        boxShadow: '0 2px 10px rgba(244,162,97,.12)',
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{ height: 110, background: 'linear-gradient(135deg, #FFF3E0, #FEFAE0)' }}
      >
        <span
          className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10"
          style={{ background: 'var(--orange-dark)' }}
        >
          {discount}% OFF
        </span>
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.opacity = 0 }}
          loading="lazy"
        />
      </div>
      <div className="p-2.5">
        <p className="text-sm font-semibold line-clamp-1 mb-1" style={{ color: 'var(--text-dark)' }}>
          {product.name}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold" style={{ color: 'var(--green-dark)' }}>
            {formatPrice(product.offer_price)}
          </span>
          <span className="text-xs line-through" style={{ color: 'var(--text-light)' }}>
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Trust Strip ──────────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: Leaf,       label: 'Farm\nFresh',     color: 'var(--green-mid)',  bg: 'var(--green-tint)' },
  { icon: Zap,        label: 'Same Day\nDeliver', color: '#7C3AED',          bg: '#F5F3FF' },
  { icon: Star,       label: 'Quality\nGuarantee', color: 'var(--orange)',   bg: '#FFF7ED' },
  { icon: Headphones, label: '24/7\nSupport',   color: 'var(--orange-dark)', bg: '#FFF1EE' },
]

function TrustStrip() {
  return (
    <div
      className="mx-4 p-4 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, var(--green-tint), #fff)',
        border: '1.5px solid var(--green-pale)',
      }}
    >
      <p className="text-center text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
        WHY SHOP WITH US
      </p>
      <div className="grid grid-cols-4 gap-2">
        {TRUST_ITEMS.map(({ icon: Icon, label, color, bg }) => (
          <div key={label} className="trust-item">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: bg }}
            >
              <Icon size={19} color={color} />
            </div>
            <span
              className="text-center leading-tight"
              style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-mid)', whiteSpace: 'pre-line' }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate()

  const { categories, loading: catLoading } = useCategories()
  const { products: featuredProducts, loading: featuredLoading } = useProducts({ is_featured: true, limit: 10 })
  const { products: allProducts, loading: allLoading } = useProducts({ limit: 20 })
  const dealProducts = allProducts.filter((p) => p.offer_price && p.offer_price < p.price)

  return (
    <div className="pb-nav page-enter" style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>
      {/* Mobile-only top bar */}
      <HomeTopBar onSearchClick={() => navigate('/shop')} />

      {/* Desktop page header */}
      <div className="hidden lg:flex items-center justify-between px-8 pt-8 pb-2">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Good day! 👋</p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-dark)' }}>
            What would you like today?
          </h1>
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
          style={{ background: 'var(--green-mid)' }}
        >
          Browse All Products
        </button>
      </div>

      <div className="flex flex-col gap-6 pt-4 pb-2 lg:px-4">
        {/* Hero Carousel — wider on desktop */}
        <div className="lg:px-4">
          <HeroCarousel />
        </div>

        {/* Desktop layout: 2-column (categories + featured) */}
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6 lg:px-4 lg:items-start flex flex-col gap-6">

          {/* Categories */}
          <div className="lg:bg-white lg:rounded-2xl lg:p-4 lg:shadow-sm lg:border lg:border-gray-100">
            <SectionHeader title="Categories" onSeeAll={() => navigate('/shop')} />
            {/* Mobile: horizontal scroll */}
            <div className="lg:hidden">
              <CategoryRow categories={categories} loading={catLoading} onSelect={(cat) => navigate(`/shop?category=${cat.id}`)} />
            </div>
            {/* Desktop: vertical list */}
            <div className="hidden lg:flex lg:flex-col lg:gap-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/shop?category=${cat.id}`)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors hover:bg-green-50 active:scale-95"
                  style={{ color: 'var(--text-mid)' }}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Featured picks */}
          <div>
            <SectionHeader title="Today's Fresh Picks 🌿" onSeeAll={() => navigate('/shop')} />
            {/* Mobile: horizontal scroll */}
            <div className="lg:hidden">
              <ProductRow products={featuredProducts} loading={featuredLoading} />
            </div>
            {/* Desktop: 3-column grid */}
            <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {featuredLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i}>
                      <div className="skeleton rounded-2xl mb-2" style={{ height: 160 }} />
                      <div className="skeleton h-4 w-3/4 rounded mb-1" />
                      <div className="skeleton h-4 w-1/2 rounded" />
                    </div>
                  ))
                : featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)
              }
            </div>
          </div>
        </div>

        {/* Deals row */}
        {dealProducts.length > 0 && (
          <div>
            <SectionHeader title="Deals & Offers 🏷️" onSeeAll={() => navigate('/shop?sort=offers')} />
            <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
              {dealProducts.slice(0, 12).map((p) => (
                <DealCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Best Sellers grid — 2 col mobile, 4 col desktop */}
        {!allLoading && allProducts.length > 0 && (
          <div>
            <SectionHeader title="Best Sellers 🏆" onSeeAll={() => navigate('/shop')} />
            <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {allProducts.slice(0, 10).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
        {allLoading && (
          <div className="px-4">
            <SkeletonProductGrid count={8} />
          </div>
        )}

        <div className="lg:px-4">
          <TrustStrip />
        </div>

        <div style={{ height: 8 }} />
      </div>

      <WhatsAppButton />
    </div>
  )
}
