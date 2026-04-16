import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProducts, useCategories } from '../../hooks/useProducts'
import { BANNERS } from '../../data/mockData'
import ProductCard from '../../components/ProductCard'
import { HomeTopBar } from '../../components/TopBar'
import { SkeletonProductGrid } from '../../components/Skeleton'
import WhatsAppButton from '../../components/WhatsAppButton'
import { formatPrice } from '../../utils/format'
import {
  Leaf, Zap, Star, Headphones, ChevronRight, Truck,
  ShieldCheck, Sprout, ArrowRight, Percent, Clock,
} from 'lucide-react'

// ─── Delivery Promise Strip ────────────────────────────────────────────────────
function DeliveryStrip() {
  return (
    <div
      className="flex items-center justify-center gap-0 overflow-x-auto scrollbar-hide px-2"
      style={{
        background: 'linear-gradient(90deg, var(--brand-800) 0%, var(--teal-700) 100%)',
        minHeight: 36,
        paddingTop: 6,
        paddingBottom: 6,
      }}
    >
      {[
        { icon: Clock,       text: 'Same-day delivery' },
        { icon: Truck,       text: 'Free above ₹299' },
        { icon: Sprout,      text: 'Farm-fresh daily' },
        { icon: ShieldCheck, text: '100% quality guarantee' },
      ].map(({ icon: Icon, text }, i) => (
        <div key={i} className="flex items-center gap-1.5 px-4 shrink-0">
          {i > 0 && <span style={{ color: 'rgba(255,255,255,.3)', marginRight: -8 }}>•</span>}
          <Icon size={12} color="rgba(255,255,255,.9)" className="ml-3" />
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255,255,255,.92)', whiteSpace: 'nowrap' }}>
            {text}
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

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % BANNERS.length), 4500)
    return () => clearInterval(timerRef.current)
  }, [])

  return (
    <div
      className="relative overflow-hidden"
      style={{ borderRadius: 20, margin: '0 16px', height: 210 }}
      onClick={() => navigate('/shop')}
    >
      {BANNERS.map((banner, i) => (
        <div
          key={banner.id}
          className="absolute inset-0 flex flex-col justify-end p-5"
          style={{
            background: banner.gradient,
            opacity: i === current ? 1 : 0,
            transition: 'opacity .7s ease',
            pointerEvents: i === current ? 'auto' : 'none',
          }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute"
            style={{
              right: -20, top: -20,
              width: 200, height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.08)',
            }}
          />
          <div
            className="absolute"
            style={{
              right: 40, bottom: -40,
              width: 130, height: 130,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.06)',
            }}
          />
          {/* Large emoji decoration */}
          <div
            className="absolute"
            style={{ right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 80, opacity: .25 }}
          >
            {banner.emoji}
          </div>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full mb-3"
            style={{ background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(8px)' }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Today's Special
            </span>
          </div>

          {/* Text */}
          <h2
            className="text-white font-bold leading-tight mb-1"
            style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', textShadow: '0 2px 8px rgba(0,0,0,.2)' }}
          >
            {banner.title}
          </h2>
          <p style={{ color: 'rgba(255,255,255,.85)', fontSize: '.875rem', marginBottom: 14 }}>
            {banner.subtitle}
          </p>

          {banner.cta && (
            <div
              className="inline-flex items-center gap-1.5 self-start px-4 py-1.5 rounded-full text-sm font-bold"
              style={{ background: '#fff', color: 'var(--brand-700)' }}
            >
              {banner.cta} <ArrowRight size={13} />
            </div>
          )}
        </div>
      ))}

      {/* Carousel dots */}
      <div className="absolute bottom-4 right-5 flex gap-1.5 items-center">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
            className={`hero-dot ${i === current ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Quick Category Pills (Blinkit-style) ──────────────────────────────────────
function QuickCategories({ categories, loading, onSelect }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex gap-2.5 px-4 overflow-x-auto scrollbar-hide">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton rounded-2xl flex-shrink-0" style={{ width: 72, height: 80 }} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2.5 px-4 overflow-x-auto scrollbar-hide pb-1">
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
            className="text-xs font-semibold text-center leading-tight"
            style={{ color: 'var(--text-mid)', maxWidth: 66 }}
          >
            {cat.name}
          </span>
        </button>
      ))}
      {/* See all */}
      <button
        onClick={() => navigate('/shop')}
        className="cat-card flex-shrink-0"
      >
        <div
          className="emoji-wrap"
          style={{ background: 'var(--gray-100)', border: '2px solid var(--border)' }}
        >
          <ChevronRight size={22} style={{ color: 'var(--text-muted)' }} />
        </div>
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>All</span>
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
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        )}
      </div>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="flex items-center gap-1 text-sm font-semibold shrink-0"
          style={{ color: 'var(--brand-600)' }}
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
          <div key={i} className="flex-shrink-0 w-[152px]">
            <div className="skeleton rounded-2xl mb-2" style={{ height: 148 }} />
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
        <div key={p.id} className="flex-shrink-0 w-[152px]">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  )
}

// ─── Promo Banners (2-up grid) ─────────────────────────────────────────────────
function PromoBanners({ navigate }) {
  const banners = [
    {
      title: 'Fresh Greens',
      subtitle: 'Harvested today',
      bg: 'linear-gradient(135deg, #0a4529 0%, #0f766e 100%)',
      emoji: '🥬',
      cta: 'Shop Now',
      link: '/shop?category=cat-1',
    },
    {
      title: 'Best Deals',
      subtitle: 'Up to 30% off',
      bg: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
      emoji: '🏷️',
      cta: 'See Offers',
      link: '/shop?sort=offers',
    },
    {
      title: 'Tropical Fruits',
      subtitle: 'Season picks',
      bg: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
      emoji: '🍋',
      cta: 'Explore',
      link: '/shop?category=cat-9',
    },
    {
      title: 'Root Veggies',
      subtitle: 'Farm to door',
      bg: 'linear-gradient(135deg, #9f1239 0%, #f43f5e 100%)',
      emoji: '🥕',
      cta: 'Buy Now',
      link: '/shop?category=cat-2',
    },
  ]

  return (
    <div className="px-4 grid grid-cols-2 gap-3">
      {banners.map((b, i) => (
        <button
          key={i}
          onClick={() => navigate(b.link)}
          className="promo-card text-left"
          style={{ background: b.bg, height: 120 }}
        >
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <div
              className="text-4xl opacity-30 absolute right-3 bottom-3"
              style={{ fontSize: 52, lineHeight: 1 }}
            >
              {b.emoji}
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{b.title}</p>
              <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 11, marginTop: 2 }}>{b.subtitle}</p>
            </div>
            <span
              className="self-start text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,.2)', color: '#fff', backdropFilter: 'blur(8px)' }}
            >
              {b.cta} →
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}

// ─── Deal Card ─────────────────────────────────────────────────────────────────
function DealCard({ product }) {
  const navigate = useNavigate()
  const discount = Math.round(((product.price - product.offer_price) / product.price) * 100)

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="flex-shrink-0 w-44 cursor-pointer card card-hover overflow-hidden"
    >
      <div
        className="relative overflow-hidden"
        style={{ height: 120, background: 'var(--amber-50)' }}
      >
        <span
          className="absolute top-2 right-2 text-white text-xs font-black px-2 py-0.5 rounded-full z-10"
          style={{ background: 'var(--red-600)', fontSize: 10 }}
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
      <div className="p-3">
        <p className="text-sm font-semibold line-clamp-1 mb-1" style={{ color: 'var(--text-dark)' }}>
          {product.name}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold" style={{ color: 'var(--brand-700)' }}>
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

// ─── Why KR Section ────────────────────────────────────────────────────────────
const WHY_KR = [
  {
    icon: Sprout,
    title: 'Farm Fresh',
    desc: 'Sourced daily from local farms',
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  {
    icon: Clock,
    title: 'Same-Day',
    desc: 'Order before 12pm, get today',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    icon: ShieldCheck,
    title: 'Guaranteed',
    desc: 'Full refund if not satisfied',
    color: '#d97706',
    bg: '#fffbeb',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    desc: 'Always here to help you',
    color: '#0284c7',
    bg: '#eff6ff',
  },
]

function WhyKR() {
  return (
    <div
      className="mx-4 rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{ background: 'linear-gradient(135deg, var(--brand-800) 0%, var(--teal-700) 100%)' }}
      >
        <p className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,.6)', textTransform: 'uppercase' }}>
          Why choose us?
        </p>
        <h3
          className="text-xl font-bold text-white leading-tight mt-1"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          The KR Promise
        </h3>
      </div>

      {/* Items */}
      <div className="grid grid-cols-2 gap-0">
        {WHY_KR.map(({ icon: Icon, title, desc, color, bg }, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 p-4"
            style={{
              background: bg,
              borderTop: i >= 2 ? `1px solid var(--border)` : 'none',
              borderLeft: i % 2 !== 0 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'white', boxShadow: 'var(--shadow-sm)' }}
            >
              <Icon size={20} color={color} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>{title}</p>
              <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Desktop Hero Banner ───────────────────────────────────────────────────────
function DesktopHero({ navigate }) {
  return (
    <div
      className="hidden lg:flex rounded-3xl overflow-hidden mx-6 mb-6"
      style={{
        height: 360,
        background: 'linear-gradient(135deg, var(--brand-900) 0%, var(--brand-700) 40%, var(--teal-700) 100%)',
        position: 'relative',
      }}
    >
      {/* Text */}
      <div className="flex flex-col justify-center px-12 py-10 z-10 max-w-2xl">
        <div
          className="inline-flex items-center gap-2 self-start mb-5 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(10px)' }}
        >
          <Sprout size={14} color="rgba(255,255,255,.9)" />
          <span style={{ color: 'rgba(255,255,255,.9)', fontSize: 12, fontWeight: 600, letterSpacing: '.04em' }}>
            FARM TO DOORSTEP
          </span>
        </div>
        <h1
          className="text-white font-bold leading-none mb-4"
          style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, textShadow: '0 2px 20px rgba(0,0,0,.2)' }}
        >
          Fresh Vegetables,<br />Delivered Today
        </h1>
        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '1.0625rem', lineHeight: 1.6, marginBottom: 28 }}>
          Handpicked daily from local farms. Same-day delivery to your doorstep.<br />Free delivery on orders above ₹299.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:shadow-lg active:scale-95"
            style={{ background: '#fff', color: 'var(--brand-700)' }}
          >
            Shop Now <ArrowRight size={15} />
          </button>
          <button
            onClick={() => navigate('/shop?sort=offers')}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,.3)' }}
          >
            <Percent size={14} /> Today's Deals
          </button>
        </div>
      </div>

      {/* Decorative circles */}
      <div
        className="absolute"
        style={{ right: -60, top: -60, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }}
      />
      <div
        className="absolute"
        style={{ right: 60, bottom: -80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }}
      />
      {/* Big emoji */}
      <div
        className="absolute"
        style={{ right: 80, top: '50%', transform: 'translateY(-50%)', fontSize: 160, opacity: .15, userSelect: 'none' }}
      >
        🥬
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
    <div className="pb-nav page-enter" style={{ background: '#fff', minHeight: '100dvh' }}>
      {/* Mobile TopBar */}
      <HomeTopBar onSearchClick={() => navigate('/shop')} />

      {/* Delivery promise strip (mobile) */}
      <div className="lg:hidden">
        <DeliveryStrip />
      </div>

      {/* Desktop greeting header */}
      <div className="hidden lg:flex items-center justify-between px-8 pt-8 pb-4">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Good day! 👋</p>
          <h1
            className="text-2xl font-bold mt-0.5 tracking-tight"
            style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-dark)' }}
          >
            What would you like today?
          </h1>
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          Browse All Products <ArrowRight size={15} />
        </button>
      </div>

      {/* ─── Desktop layout ─── */}
      <div className="hidden lg:block">
        <DesktopHero navigate={navigate} />

        <div className="px-6 grid grid-cols-[280px_1fr] gap-6 items-start">
          {/* Left: Categories */}
          <div
            className="rounded-2xl overflow-hidden sticky top-6"
            style={{ border: '1px solid var(--border)', background: '#fff' }}
          >
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <h2
                className="font-bold text-base tracking-tight"
                style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-dark)' }}
              >
                Categories
              </h2>
            </div>
            <div className="p-3 flex flex-col gap-0.5">
              <button
                onClick={() => navigate('/shop')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all hover:bg-green-50 active:scale-97"
                style={{ color: 'var(--brand-600)', fontWeight: 600 }}
              >
                <span className="text-xl">🛒</span> All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/shop?category=${cat.id}`)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all hover:bg-green-50 active:scale-97"
                  style={{ color: 'var(--text-mid)' }}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Main content */}
          <div className="flex flex-col gap-8">
            {/* Featured picks */}
            <div>
              <SectionHeader
                title="Today's Fresh Picks 🌿"
                subtitle="Handpicked from local farms this morning"
                onSeeAll={() => navigate('/shop')}
              />
              <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
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

            {/* Deals */}
            {dealProducts.length > 0 && (
              <div>
                <SectionHeader
                  title="Deals & Offers 🏷️"
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
                  title="Best Sellers 🏆"
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
        <div className="px-6 py-8 mt-4">
          <div
            className="rounded-2xl p-8"
            style={{ background: 'linear-gradient(135deg, var(--brand-25) 0%, #fff 100%)', border: '1px solid var(--brand-100)' }}
          >
            <p className="text-center text-xs font-bold tracking-widest mb-2" style={{ color: 'var(--brand-600)', textTransform: 'uppercase' }}>
              The KR Promise
            </p>
            <h2
              className="text-center text-2xl font-bold mb-8"
              style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-dark)' }}
            >
              Why 10,000+ families choose us
            </h2>
            <div className="grid grid-cols-4 gap-6">
              {WHY_KR.map(({ icon: Icon, title, desc, color, bg }) => (
                <div key={title} className="flex flex-col items-center text-center gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: bg, boxShadow: 'var(--shadow-sm)' }}
                  >
                    <Icon size={26} color={color} />
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-dark)' }}>{title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile layout ─── */}
      <div className="lg:hidden flex flex-col gap-7 pt-3 pb-2">
        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Quick Categories */}
        <div>
          <SectionHeader title="Shop by Category" onSeeAll={() => navigate('/shop')} />
          <QuickCategories
            categories={categories}
            loading={catLoading}
            onSelect={(cat) => navigate(`/shop?category=${cat.id}`)}
          />
        </div>

        {/* Promo banners 2×2 */}
        <PromoBanners navigate={navigate} />

        {/* Featured picks */}
        <div>
          <SectionHeader
            title="Today's Fresh Picks 🌿"
            subtitle="Harvested this morning"
            onSeeAll={() => navigate('/shop')}
          />
          <ProductRow products={featuredProducts} loading={featuredLoading} />
        </div>

        {/* Deals row */}
        {dealProducts.length > 0 && (
          <div>
            <SectionHeader
              title="Deals & Offers 🏷️"
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
              title="Best Sellers 🏆"
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

        {/* Why KR section */}
        <WhyKR />

        <div style={{ height: 8 }} />
      </div>

      <WhatsAppButton />
    </div>
  )
}
