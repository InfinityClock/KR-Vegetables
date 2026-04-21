import { Plus, Minus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { formatPrice, getDiscountPercent } from '../utils/format'
import { PLACEHOLDER_IMAGE } from '../constants'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { items, addItem, updateQuantity } = useCartStore()
  const cartItem = items.find((i) => i.id === product.id)
  const qty = cartItem?.quantity || 0
  const isOutOfStock = product.stock_status === 'out_of_stock'
  const hasOffer = product.offer_price && product.offer_price < product.price
  const discount = getDiscountPercent(product.price, product.offer_price)
  const displayPrice = hasOffer ? product.offer_price : product.price

  const handleAdd = (e) => {
    e.stopPropagation()
    if (isOutOfStock) return
    addItem(product)
    toast.success(`${product.name} added`, { duration: 1000 })
  }
  const handleIncrease = (e) => { e.stopPropagation(); updateQuantity(product.id, qty + 1) }
  const handleDecrease = (e) => { e.stopPropagation(); updateQuantity(product.id, qty - 1) }

  return (
    <article
      onClick={() => navigate(`/product/${product.id}`)}
      className="card-hover cursor-pointer flex flex-col"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* ── Image ── */}
      <div
        className="relative overflow-hidden"
        style={{ height: 152, background: 'var(--warm-50)', flexShrink: 0 }}
      >
        {/* Discount badge */}
        {hasOffer && (
          <div
            className="absolute top-2 left-2 z-10"
            style={{
              background: 'var(--brand-800)',
              color: '#fff',
              fontFamily: 'var(--font-body)',
              fontSize: '9px',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 'var(--radius-xs)',
              letterSpacing: '.4px',
              textTransform: 'uppercase',
            }}
          >
            −{discount}%
          </div>
        )}
        {!hasOffer && product.offer_label && (
          <div
            className="absolute top-2 left-2 z-10"
            style={{
              background: 'var(--amber-600)',
              color: '#fff',
              fontFamily: 'var(--font-body)',
              fontSize: '9px',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 'var(--radius-xs)',
              letterSpacing: '.4px',
            }}
          >
            {product.offer_label}
          </div>
        )}

        {product.stock_status === 'limited' && (
          <div
            className="absolute top-2 right-2 z-10"
            style={{
              background: 'var(--amber-50)',
              color: 'var(--amber-800)',
              fontFamily: 'var(--font-body)',
              fontSize: '9px',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--amber-100)',
            }}
          >
            Few left
          </div>
        )}

        <img
          src={product.image_url || PLACEHOLDER_IMAGE}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500"
          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
          loading="lazy"
          style={{ transformOrigin: 'center' }}
        />

        {isOutOfStock && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(245,242,236,.75)', backdropFilter: 'blur(2px)' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--text-mid)',
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                background: 'var(--bg-card)',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)',
              }}
            >
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-3 gap-1">
        {/* Name */}
        <h3
          className="leading-tight line-clamp-2"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-dark)',
            letterSpacing: '-.01em',
          }}
        >
          {product.name}
        </h3>

        {/* Tamil name */}
        {product.tamil_name && (
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            {product.tamil_name}
          </p>
        )}

        {/* Unit */}
        <p style={{ fontSize: '11px', color: 'var(--text-light)', fontFamily: 'var(--font-body)' }}>
          {product.unit}
        </p>

        <div className="flex-1" />

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-1">
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--text-dark)',
            letterSpacing: '-.02em',
          }}>
            {formatPrice(displayPrice)}
          </span>
          {hasOffer && (
            <span style={{ fontSize: '11px', color: 'var(--text-light)', textDecoration: 'line-through', fontFamily: 'var(--font-body)' }}>
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Cart control */}
        {qty === 0 ? (
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="btn-ripple transition-all"
            style={isOutOfStock ? {
              width: '100%',
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--warm-100)',
              color: 'var(--text-light)',
              cursor: 'not-allowed',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
            } : {
              width: '100%',
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--brand-800)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '.02em',
            }}
          >
            <Plus size={13} strokeWidth={2.5} />
            Add
          </button>
        ) : (
          <div
            className="flex items-center justify-between px-1.5"
            style={{
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--brand-800)',
            }}
          >
            <button
              onClick={handleDecrease}
              className="qty-btn"
              style={{ color: '#fff', background: 'rgba(255,255,255,.12)' }}
            >
              <Minus size={12} strokeWidth={2.5} />
            </button>
            <span style={{ color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px' }}>
              {qty}
            </span>
            <button
              onClick={handleIncrease}
              className="qty-btn"
              style={{ color: '#fff', background: 'rgba(255,255,255,.12)' }}
            >
              <Plus size={12} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
