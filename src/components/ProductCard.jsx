import { Plus, Minus, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { formatPrice, getDiscountPercent } from '../utils/format'
import { STOCK_STATUS, PLACEHOLDER_IMAGE } from '../constants'
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
    toast.success(`${product.name} added!`, { duration: 1200 })
  }
  const handleIncrease = (e) => { e.stopPropagation(); updateQuantity(product.id, qty + 1) }
  const handleDecrease = (e) => { e.stopPropagation(); updateQuantity(product.id, qty - 1) }

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="card card-hover overflow-hidden cursor-pointer flex flex-col"
      style={{ borderRadius: 'var(--radius-lg)' }}
    >
      {/* Image area */}
      <div className="relative overflow-hidden" style={{ height: 148, background: 'var(--brand-25)' }}>

        {/* Discount badge — top-left pill */}
        {hasOffer && (
          <div
            className="absolute top-2 left-2 z-10 flex items-center gap-1 text-white font-black rounded-full px-2 py-0.5"
            style={{ background: 'var(--red-600)', fontSize: 10, letterSpacing: '.3px' }}
          >
            {discount}% OFF
          </div>
        )}
        {!hasOffer && product.offer_label && (
          <div
            className="absolute top-2 left-2 z-10 text-white font-black rounded-full px-2 py-0.5"
            style={{ background: 'var(--amber-600)', fontSize: 10 }}
          >
            {product.offer_label}
          </div>
        )}

        {/* Limited stock badge */}
        {product.stock_status === 'limited' && (
          <div
            className="absolute top-2 right-2 z-10 font-semibold rounded-full px-2 py-0.5"
            style={{ background: 'var(--amber-100)', color: 'var(--amber-700)', fontSize: 9 }}
          >
            Few Left
          </div>
        )}

        <img
          src={product.image_url || PLACEHOLDER_IMAGE}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300"
          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
          loading="lazy"
        />

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(1px)' }}
          >
            <span
              className="text-white text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(220,38,38,.9)', fontSize: '0.7rem' }}
            >
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {/* Name */}
        <h3
          className="text-sm font-semibold leading-tight line-clamp-2"
          style={{ color: 'var(--text-dark)', letterSpacing: '-.01em' }}
        >
          {product.name}
        </h3>

        {/* Tamil name */}
        {product.tamil_name && (
          <p className="text-xs font-medium" style={{ color: 'var(--brand-600)', lineHeight: 1.3 }}>
            {product.tamil_name}
          </p>
        )}

        {/* Unit */}
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{product.unit}</p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price row */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold" style={{ color: 'var(--brand-700)', letterSpacing: '-.01em' }}>
            {formatPrice(displayPrice)}
          </span>
          {hasOffer && (
            <span className="text-xs line-through" style={{ color: 'var(--text-light)' }}>
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Cart controls */}
        {qty === 0 ? (
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="w-full h-8 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 btn-ripple transition-all"
            style={isOutOfStock ? {
              background: 'var(--gray-100)',
              color: 'var(--text-light)',
              cursor: 'not-allowed',
            } : {
              background: 'var(--brand-600)',
              color: '#fff',
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Add
          </button>
        ) : (
          <div
            className="flex items-center justify-between rounded-xl h-8 px-1.5"
            style={{ background: 'var(--brand-600)' }}
          >
            <button
              onClick={handleDecrease}
              className="qty-btn"
              style={{ color: '#fff', background: 'rgba(255,255,255,.15)' }}
            >
              <Minus size={13} strokeWidth={2.5} />
            </button>
            <span className="text-white font-bold text-sm tracking-wide">{qty}</span>
            <button
              onClick={handleIncrease}
              className="qty-btn"
              style={{ color: '#fff', background: 'rgba(255,255,255,.15)' }}
            >
              <Plus size={13} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
