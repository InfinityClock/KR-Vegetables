import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, ArrowLeft, Share2, Leaf } from 'lucide-react'
import { useProduct } from '../../hooks/useProducts'
import { useCartStore } from '../../store/cartStore'
import { formatPrice, getDiscountPercent } from '../../utils/format'
import { PLACEHOLDER_IMAGE } from '../../constants'
import ProductCard from '../../components/ProductCard'
import toast from 'react-hot-toast'

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="pb-nav" style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>
      <div className="skeleton w-full" style={{ height: 280 }} />
      <div className="p-4 flex flex-col gap-4">
        <div className="skeleton h-7 w-2/3 rounded-xl" />
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="skeleton h-20 rounded-2xl" />
        <div className="skeleton h-14 rounded-2xl" />
      </div>
    </div>
  )
}

// ─── Stock Badge ──────────────────────────────────────────────────────────────
const STOCK_MAP = {
  in_stock:      { label: 'Fresh & Available', cls: 'badge-in-stock' },
  limited:       { label: 'Limited Stock',     cls: 'badge-limited-stock' },
  out_of_stock:  { label: 'Out of Stock',       cls: 'badge-out-of-stock' },
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { product, related, loading } = useProduct(id)
  const { items, addItem, updateQuantity } = useCartStore()
  const [localQty, setLocalQty] = useState(1)

  if (loading) return <DetailSkeleton />

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="text-4xl">🌿</div>
        <p className="text-lg font-semibold" style={{ color: 'var(--text-dark)', fontFamily: 'Playfair Display, serif' }}>
          Product not found
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-white"
          style={{ background: 'var(--green-mid)' }}
        >
          Go Back
        </button>
      </div>
    )
  }

  const cartItem     = items.find((i) => i.id === id)
  const inCartQty    = cartItem?.quantity || 0
  const displayPrice = product.offer_price || product.price
  const hasOffer     = product.offer_price && product.offer_price < product.price
  const discount     = getDiscountPercent(product.price, product.offer_price)
  const stockInfo    = STOCK_MAP[product.stock_status] || STOCK_MAP.in_stock
  const isOutOfStock = product.stock_status === 'out_of_stock'

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem(product, localQty)
    toast.success(`${localQty}× ${product.name} added to cart 🛒`, { duration: 1500 })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} at KR Vegetables & Fruits!`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard?.writeText(window.location.href)
      toast.success('Link copied!')
    }
  }

  return (
    <div className="pb-nav page-enter" style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>

      {/* Desktop back button row */}
      <div className="hidden lg:flex items-center gap-3 px-8 pt-6 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-mid)' }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        {product.categories && (
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {product.categories.emoji} {product.categories.name}
          </span>
        )}
      </div>

      {/* ── Desktop 2-col / Mobile stacked ── */}
      <div className="lg:grid lg:grid-cols-[480px_1fr] lg:gap-8 lg:px-8 lg:items-start lg:pb-10">

        {/* ── Left: Hero Image ── */}
        <div className="lg:sticky lg:top-6">
          {/* Mobile hero (full-bleed) */}
          <div className="relative lg:hidden" style={{ height: 300 }}>
            <img
              src={product.image_url || PLACEHOLDER_IMAGE}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
            />
            <div
              className="absolute inset-x-0 bottom-0"
              style={{ height: 100, background: 'linear-gradient(to top, rgba(255,253,247,1) 20%, transparent)' }}
            />
            {/* Mobile back + share */}
            <div
              className="absolute top-0 left-0 right-0 flex justify-between items-center p-4"
              style={{ paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))' }}
            >
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(8px)', boxShadow: 'var(--shadow-sm)' }}
              >
                <ArrowLeft size={20} style={{ color: 'var(--text-dark)' }} />
              </button>
              <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(8px)', boxShadow: 'var(--shadow-sm)' }}
              >
                <Share2 size={18} style={{ color: 'var(--text-dark)' }} />
              </button>
            </div>
            {hasOffer && (
              <div
                className="absolute bottom-4 right-4 text-white text-sm font-bold px-3 py-1 rounded-full"
                style={{ background: 'var(--orange-dark)', boxShadow: 'var(--shadow-sm)' }}
              >
                {discount}% OFF
              </div>
            )}
          </div>

          {/* Desktop hero (card style) */}
          <div
            className="hidden lg:block relative rounded-3xl overflow-hidden"
            style={{ height: 420, background: 'var(--green-tint)', border: '1px solid var(--border-light)' }}
          >
            <img
              src={product.image_url || PLACEHOLDER_IMAGE}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
            />
            {hasOffer && (
              <div
                className="absolute top-4 left-4 text-white text-sm font-bold px-3 py-1.5 rounded-full"
                style={{ background: 'var(--orange-dark)', boxShadow: 'var(--shadow-sm)' }}
              >
                {discount}% OFF
              </div>
            )}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(8px)', boxShadow: 'var(--shadow-sm)' }}
            >
              <Share2 size={18} style={{ color: 'var(--text-dark)' }} />
            </button>
          </div>
        </div>

        {/* ── Right: Content ── */}
        <div className="px-4 pt-2 lg:px-0 lg:pt-0 flex flex-col gap-4">

          {/* Name + category + stock */}
          <div>
            {product.categories && (
              <div className="flex items-center gap-1.5 mb-1.5 lg:hidden">
                <span className="text-base">{product.categories.emoji}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {product.categories.name}
                </span>
              </div>
            )}
            <div className="flex items-start gap-2 justify-between">
              <div className="flex-1">
                <h1
                  className="text-2xl lg:text-3xl font-bold leading-tight"
                  style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-dark)' }}
                >
                  {product.name}
                </h1>
                {product.tamil_name && (
                  <p className="text-base font-medium mt-0.5" style={{ color: 'var(--green-mid)' }}>
                    {product.tamil_name}
                  </p>
                )}
              </div>
              <span className={`flex-shrink-0 mt-1 text-xs font-semibold px-2.5 py-1 rounded-full ${stockInfo.cls}`}>
                {stockInfo.label}
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Per {product.unit}</p>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>
              {product.description}
            </p>
          )}

          {/* Price card */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: hasOffer
                ? 'linear-gradient(135deg, #FFF7ED, #FEFAE0)'
                : 'linear-gradient(135deg, var(--green-tint), #fff)',
              border: `1.5px solid ${hasOffer ? '#FDDCB5' : 'var(--green-pale)'}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-3xl font-bold"
                    style={{ color: hasOffer ? 'var(--orange-dark)' : 'var(--green-dark)', fontFamily: 'Playfair Display, serif' }}
                  >
                    {formatPrice(displayPrice)}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/ {product.unit}</span>
                </div>
                {hasOffer && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm line-through" style={{ color: 'var(--text-light)' }}>
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--orange-dark)' }}>
                      Save {formatPrice(product.price - product.offer_price)}
                    </span>
                  </div>
                )}
              </div>
              {product.offer_label && (
                <span
                  className="text-xs font-bold px-3 py-1.5 rounded-xl"
                  style={{ background: 'var(--orange)', color: '#fff' }}
                >
                  {product.offer_label}
                </span>
              )}
            </div>
          </div>

          {/* Freshness note */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: 'var(--green-tint)', border: '1px solid var(--green-pale)' }}
          >
            <Leaf size={15} style={{ color: 'var(--green-mid)', flexShrink: 0 }} />
            <p className="text-xs font-medium" style={{ color: 'var(--green-dark)' }}>
              Sourced fresh daily · Quality guaranteed or full refund
            </p>
          </div>

          {/* Qty selector */}
          {!isOutOfStock && inCartQty === 0 && (
            <div
              className="rounded-2xl p-4"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-mid)' }}>
                Select Quantity
              </p>
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 rounded-xl p-1"
                  style={{ background: 'var(--bg-muted)' }}
                >
                  <button
                    onClick={() => setLocalQty(Math.max(1, localQty - 1))}
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    <Minus size={16} style={{ color: 'var(--text-mid)' }} />
                  </button>
                  <span className="w-8 text-center text-xl font-bold" style={{ color: 'var(--text-dark)' }}>
                    {localQty}
                  </span>
                  <button
                    onClick={() => setLocalQty(localQty + 1)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ background: 'var(--green-mid)' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <p className="text-base font-bold" style={{ color: 'var(--text-dark)' }}>
                  = {formatPrice(displayPrice * localQty)}
                </p>
              </div>
            </div>
          )}

          {/* In-cart adjuster */}
          {!isOutOfStock && inCartQty > 0 && (
            <div
              className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: 'var(--green-tint)', border: '1.5px solid var(--green-pale)' }}
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--green-dark)' }}>
                {inCartQty} in cart
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(id, inCartQty - 1)}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <Minus size={14} style={{ color: 'var(--text-dark)' }} />
                </button>
                <span className="w-6 text-center font-bold" style={{ color: 'var(--green-dark)' }}>
                  {inCartQty}
                </span>
                <button
                  onClick={() => updateQuantity(id, inCartQty + 1)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'var(--green-mid)' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* CTA */}
          {isOutOfStock ? (
            <div
              className="rounded-2xl p-4 text-center font-semibold text-sm"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}
            >
              Out of Stock — Check back later
            </div>
          ) : inCartQty > 0 ? (
            <button
              onClick={() => navigate('/cart')}
              className="w-full h-14 rounded-2xl text-white font-bold flex items-center justify-center gap-2 btn-ripple"
              style={{ background: 'linear-gradient(135deg, var(--green-dark), var(--green-mid))', boxShadow: 'var(--shadow-md)' }}
            >
              <ShoppingCart size={20} />
              View Cart
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full h-14 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 btn-ripple"
              style={{ background: 'linear-gradient(135deg, var(--green-dark), var(--green-mid))', boxShadow: 'var(--shadow-md)' }}
            >
              <ShoppingCart size={20} />
              Add {localQty > 1 ? `${localQty}× ` : ''}to Cart · {formatPrice(displayPrice * localQty)}
            </button>
          )}
        </div>
      </div>

      {/* ── Related Products ───────────────────────────────────── */}
      {related.length > 0 && (
        <div className="mt-6 pb-4 lg:px-8">
          <h3
            className="px-4 lg:px-0 mb-3 text-lg font-bold"
            style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-dark)' }}
          >
            More from this category
          </h3>
          <div className="flex gap-3 px-4 lg:px-0 overflow-x-auto scrollbar-hide pb-1 lg:grid lg:grid-cols-4 xl:grid-cols-6 lg:overflow-visible">
            {related.map((p) => (
              <div key={p.id} className="flex-shrink-0 w-[148px] lg:w-auto">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
