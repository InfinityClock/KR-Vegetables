import { Plus, Minus } from 'lucide-react'
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
  const stock = STOCK_STATUS[product.stock_status]

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
      className="card card-hover overflow-hidden cursor-pointer"
      style={{ borderRadius: 'var(--radius-lg)' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 140, background: 'var(--green-tint)' }}>
        {hasOffer && (
          <div className="offer-ribbon">{discount}% OFF</div>
        )}
        {!hasOffer && product.offer_label && (
          <div className="offer-ribbon">{product.offer_label}</div>
        )}
        <img
          src={product.image_url || PLACEHOLDER_IMAGE}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
          loading="lazy"
          style={{ transition: 'transform .3s ease' }}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-end justify-center pb-3"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,.1))' }}
          >
            <span
              className="text-white text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(239,68,68,.9)' }}
            >
              Out of Stock
            </span>
          </div>
        )}
        {/* Limited stock badge */}
        {product.stock_status === 'limited' && (
          <div className="absolute top-2 right-2">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: '#FEF9C3', color: '#92400E' }}
            >
              Limited
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 flex flex-col gap-1.5">
        <h3
          className="text-sm font-semibold leading-tight line-clamp-2"
          style={{ color: 'var(--text-dark)' }}
        >
          {product.name}
        </h3>

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{product.unit}</p>

        {/* Price row */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold" style={{ color: 'var(--green-dark)' }}>
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
            className="w-full h-8 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 btn-ripple transition-colors"
            style={isOutOfStock ? {
              background: 'var(--bg-muted)',
              color: 'var(--text-light)',
              cursor: 'not-allowed',
            } : {
              background: 'var(--green-mid)',
              color: '#fff',
            }}
          >
            <Plus size={14} />
            Add
          </button>
        ) : (
          <div
            className="flex items-center justify-between rounded-xl h-8 px-1"
            style={{ background: 'var(--green-mid)' }}
          >
            <button
              onClick={handleDecrease}
              className="qty-btn"
              style={{ color: '#fff' }}
            >
              <Minus size={14} />
            </button>
            <span className="text-white font-bold text-sm">{qty}</span>
            <button
              onClick={handleIncrease}
              className="qty-btn"
              style={{ color: '#fff' }}
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
