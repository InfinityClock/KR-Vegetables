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
      className="cursor-pointer flex flex-col"
      style={{
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 2px 12px rgba(28,26,23,.07)',
        overflow: 'hidden',
        fontFamily: 'var(--font-body)',
        transition: 'box-shadow .22s ease, transform .2s cubic-bezier(.22,1,.36,1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 32px rgba(28,26,23,.14)'
        e.currentTarget.style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(28,26,23,.07)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ height: 168, background: 'var(--warm-50)' }}>
        {hasOffer && (
          <div
            className="absolute top-2.5 left-2.5 z-10"
            style={{
              background: '#e53e3e',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 9px',
              borderRadius: 99,
              letterSpacing: '.3px',
            }}
          >
            -{discount}%
          </div>
        )}
        {!hasOffer && product.offer_label && (
          <div
            className="absolute top-2.5 left-2.5 z-10"
            style={{
              background: 'var(--amber-600)',
              color: '#fff',
              fontSize: '9px',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 99,
            }}
          >
            {product.offer_label}
          </div>
        )}
        {product.stock_status === 'limited' && (
          <div
            className="absolute top-2.5 right-2.5 z-10"
            style={{
              background: '#fff8e6',
              color: '#b45309',
              fontSize: '9px',
              fontWeight: 600,
              padding: '3px 9px',
              borderRadius: 99,
              border: '1px solid #fde68a',
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
        />

        {isOutOfStock && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(250,248,244,.84)', backdropFilter: 'blur(3px)' }}
          >
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--text-mid)',
                letterSpacing: '.07em',
                textTransform: 'uppercase',
                background: '#fff',
                padding: '5px 14px',
                borderRadius: 99,
                border: '1px solid var(--border)',
              }}
            >
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1" style={{ padding: '11px 12px 13px', gap: 2 }}>
        <h3
          className="line-clamp-2 leading-snug"
          style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', letterSpacing: '-.01em' }}
        >
          {product.name}
        </h3>

        {product.tamil_name && (
          <p style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{product.tamil_name}</p>
        )}

        <p style={{ fontSize: '11px', color: 'var(--text-light)' }}>{product.unit}</p>

        <div className="flex-1" />

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-.02em' }}>
            {formatPrice(displayPrice)}
          </span>
          {hasOffer && (
            <span style={{ fontSize: '11px', color: 'var(--text-light)', textDecoration: 'line-through' }}>
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Cart control */}
        {qty === 0 ? (
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="btn-ripple mt-2"
            style={
              isOutOfStock
                ? {
                    width: '100%',
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--warm-100)',
                    color: 'var(--text-light)',
                    border: 'none',
                    cursor: 'not-allowed',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                  }
                : {
                    width: '100%',
                    height: 36,
                    borderRadius: 10,
                    background: 'transparent',
                    border: '1.5px solid var(--brand-500)',
                    color: 'var(--brand-700)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    fontSize: '12.5px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-body)',
                    letterSpacing: '.01em',
                    transition: 'background .15s, color .15s',
                  }
            }
            onMouseEnter={(e) => {
              if (!isOutOfStock) {
                e.currentTarget.style.background = 'var(--brand-800)'
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.borderColor = 'var(--brand-800)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isOutOfStock) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--brand-700)'
                e.currentTarget.style.borderColor = 'var(--brand-500)'
              }
            }}
          >
            <Plus size={13} strokeWidth={2.5} />
            Add
          </button>
        ) : (
          <div
            className="flex items-center justify-between mt-2"
            style={{
              height: 36,
              borderRadius: 10,
              background: 'var(--brand-800)',
              paddingInline: 6,
            }}
          >
            <button
              onClick={handleDecrease}
              style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'rgba(255,255,255,.15)',
                border: 'none', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Minus size={11} strokeWidth={2.5} />
            </button>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-body)' }}>
              {qty}
            </span>
            <button
              onClick={handleIncrease}
              style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'rgba(255,255,255,.15)',
                border: 'none', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Plus size={11} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
