import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, Truck, Tag, Clock } from 'lucide-react'
import {
  useCartStore,
  useCartSubtotal,
  useCartDeliveryFee,
  useCartTotal,
} from '../../store/cartStore'
import { formatPrice } from '../../utils/format'
import { PLACEHOLDER_IMAGE, getNextDeliveryWindow } from '../../constants'
import { useSettingsStore } from '../../store/settingsStore'
import { PageTopBar } from '../../components/TopBar'
import toast from 'react-hot-toast'

// ─── Cart Item ────────────────────────────────────────────────────────────────
function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCartStore()
  const displayPrice = item.offer_price || item.price
  const hasOffer = item.offer_price && item.offer_price < item.price

  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xs)' }}
    >
      {/* Image */}
      <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden" style={{ background: 'var(--green-tint)' }}>
        <img
          src={item.image_url || PLACEHOLDER_IMAGE}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold line-clamp-2 leading-tight mb-0.5" style={{ color: 'var(--text-dark)' }}>
          {item.name}
        </p>
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-sm font-bold" style={{ color: 'var(--green-dark)' }}>
            {formatPrice(displayPrice)}
          </span>
          {hasOffer && (
            <span className="text-xs line-through" style={{ color: 'var(--text-light)' }}>
              {formatPrice(item.price)}
            </span>
          )}
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ {item.unit}</span>
        </div>

        {/* Qty + total */}
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 p-1 rounded-xl"
            style={{ background: 'var(--bg-muted)' }}
          >
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="qty-btn"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
            >
              <Minus size={13} />
            </button>
            <span className="w-5 text-center text-sm font-bold" style={{ color: 'var(--text-dark)' }}>
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="qty-btn text-white"
              style={{ background: 'var(--green-mid)' }}
            >
              <Plus size={13} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>
              {formatPrice(displayPrice * item.quantity)}
            </span>
            <button
              onClick={() => { removeItem(item.id); toast.success('Removed from cart') }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
            >
              <Trash2 size={13} style={{ color: '#DC2626' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Delivery Progress Bar ────────────────────────────────────────────────────
function DeliveryProgress({ subtotal, freeDeliveryAbove }) {
  const pct = Math.min(100, (subtotal / freeDeliveryAbove) * 100)
  const remaining = freeDeliveryAbove - subtotal

  if (subtotal >= freeDeliveryAbove) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-2xl"
        style={{ background: 'var(--green-tint)', border: '1.5px solid var(--green-pale)' }}
      >
        <Truck size={16} style={{ color: 'var(--green-mid)', flexShrink: 0 }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--green-dark)' }}>
          You've unlocked FREE delivery! 🎉
        </p>
      </div>
    )
  }

  return (
    <div
      className="px-4 py-3 rounded-2xl"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Truck size={14} style={{ color: 'var(--text-muted)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Add <span className="font-semibold" style={{ color: 'var(--green-mid)' }}>{formatPrice(remaining)}</span> for FREE delivery
          </p>
        </div>
        <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          {Math.round(pct)}%
        </p>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--green-light), var(--green-mid))' }}
        />
      </div>
    </div>
  )
}

// ─── Main Cart ────────────────────────────────────────────────────────────────
export default function Cart() {
  const navigate = useNavigate()
  const { items, notes, setNotes, clearCart } = useCartStore()
  const nextWindow = getNextDeliveryWindow()
  const subtotal    = useCartSubtotal()
  const deliveryFee = useCartDeliveryFee()
  const total       = useCartTotal()
  const { min_order_amount, free_delivery_above, store_open } = useSettingsStore()
  const isMinOrder  = subtotal >= min_order_amount
  const canCheckout = store_open && isMinOrder

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="pb-nav page-enter" style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>
        <PageTopBar title="My Cart" showBack={false} />
        <div className="flex flex-col items-center justify-center py-20 px-8 gap-4">
          <div className="text-6xl">🛒</div>
          <h2
            className="text-xl font-bold text-center"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dark)' }}
          >
            Your cart is empty
          </h2>
          <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            Browse our fresh vegetables and fruits and add items to your cart.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-2 px-8 py-3 rounded-full font-semibold text-white btn-ripple"
            style={{ background: 'linear-gradient(135deg, var(--green-dark), var(--green-mid))' }}
          >
            Start Shopping
          </button>
        </div>
      </div>
    )
  }

  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="pb-cart page-enter" style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>
      <PageTopBar
        title={`My Cart (${itemCount})`}
        showBack={false}
        rightAction={
          <button
            onClick={() => { clearCart(); toast.success('Cart cleared') }}
            className="text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ color: 'var(--orange-dark)', background: '#FFF1EE' }}
          >
            Clear all
          </button>
        }
      />

      {/* Desktop heading */}
      <div className="hidden lg:flex items-center justify-between px-8 pt-8 pb-4">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dark)' }}>
          My Cart ({itemCount} item{itemCount !== 1 ? 's' : ''})
        </h1>
        <button
          onClick={() => { clearCart(); toast.success('Cart cleared') }}
          className="text-sm font-medium px-4 py-2 rounded-full"
          style={{ color: 'var(--orange-dark)', background: '#FFF1EE' }}
        >
          Clear all
        </button>
      </div>

      {/* Desktop 2-column: items left, summary right */}
      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 lg:px-8 lg:items-start flex flex-col gap-4 p-4 lg:p-0 lg:pb-8">

        {/* ── Left column: items + slot + notes ── */}
        <div className="flex flex-col gap-3">

          {/* Store closed banner */}
          {!store_open && (
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-2xl"
              style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5' }}
            >
              <Clock size={16} style={{ color: '#DC2626', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#DC2626' }}>Store is currently closed</p>
                <p className="text-xs mt-0.5" style={{ color: '#B91C1C' }}>
                  You can keep items in your cart and place the order when we reopen.
                </p>
              </div>
            </div>
          )}

          {/* Min order warning — shown at top so it's immediately visible */}
          {!isMinOrder && (
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
              style={{ background: '#FFF7ED', border: '1.5px solid #FDDCB5' }}
            >
              <Tag size={15} style={{ color: '#B45309', flexShrink: 0 }} />
              <p className="text-sm font-medium" style={{ color: '#92400E' }}>
                Add{' '}
                <span className="font-bold">{formatPrice(min_order_amount - subtotal)}</span>
                {' '}more to reach the ₹{min_order_amount} minimum
              </p>
            </div>
          )}

          {/* Items */}
          <div className="flex flex-col gap-2.5">
            {items.map((item) => <CartItem key={item.id} item={item} />)}
          </div>

          {/* Free delivery progress */}
          <DeliveryProgress subtotal={subtotal} freeDeliveryAbove={free_delivery_above} />

          {/* Delivery window */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
            style={{ background: 'var(--green-tint)', border: '1.5px solid var(--green-pale)' }}
          >
            <Clock size={17} style={{ color: 'var(--green-mid)', flexShrink: 0 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--green-dark)' }}>
                Next delivery: <span style={{ color: 'var(--green-mid)' }}>{nextWindow}</span>
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                We deliver 8AM–1PM &amp; 3PM–8PM daily
              </p>
            </div>
          </div>

          {/* Notes */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
          >
            <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
              Special Instructions
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions? (e.g. cut vegetables, extra fresh, etc.)"
              rows={3}
              className="w-full text-sm outline-none resize-none rounded-xl p-3"
              style={{
                color: 'var(--text-dark)',
                background: 'var(--bg-muted)',
                border: '1px solid var(--border)',
              }}
            />
          </div>
        </div>

        {/* ── Right column: price summary + CTA (sticky on desktop) ── */}
        <div className="flex flex-col gap-3 lg:sticky lg:top-20">
          {/* Price breakdown */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
          >
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-dark)' }}>
              Price Details
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>
                  Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})
                </span>
                <span style={{ color: 'var(--text-dark)' }}>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
                <span
                  className="font-semibold"
                  style={{ color: deliveryFee === 0 ? 'var(--green-mid)' : 'var(--text-dark)' }}
                >
                  {deliveryFee === 0 ? '🎉 FREE' : formatPrice(deliveryFee)}
                </span>
              </div>
              <div
                className="flex justify-between pt-2 mt-1 font-bold text-base"
                style={{ borderTop: '1px dashed var(--border)' }}
              >
                <span style={{ color: 'var(--text-dark)' }}>Total</span>
                <span style={{ color: 'var(--green-dark)' }}>{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              if (!store_open) { toast.error('Store is currently closed'); return }
              if (!isMinOrder) { toast.error(`Minimum order is ${formatPrice(min_order_amount)}`); return }
              navigate('/checkout')
            }}
            disabled={!canCheckout}
            className="w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 btn-ripple"
            style={canCheckout ? {
              background: 'linear-gradient(135deg, var(--green-dark), var(--green-mid))',
              color: '#fff',
              boxShadow: 'var(--shadow-md)',
            } : {
              background: 'var(--bg-muted)',
              color: 'var(--text-light)',
              cursor: 'not-allowed',
            }}
          >
            <ShoppingBag size={20} />
            {store_open ? `Proceed to Checkout · ${formatPrice(total)}` : 'Store Closed'}
          </button>
        </div>

      </div>

      {/* ── Sticky checkout bar — mobile only ── */}
      <div
        className="lg:hidden fixed left-0 right-0 z-40 px-4 py-3"
        style={{
          bottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom, 0px))',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border-light)',
          boxShadow: '0 -4px 20px rgba(28,26,23,.08)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col" style={{ minWidth: 0 }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              Total
            </span>
            <span className="text-base font-bold" style={{ color: 'var(--green-dark)', fontFamily: 'var(--font-body)' }}>
              {formatPrice(total)}
            </span>
          </div>
          <button
            onClick={() => {
              if (!store_open) { toast.error('Store is currently closed'); return }
              if (!isMinOrder) { toast.error(`Minimum order is ${formatPrice(min_order_amount)}`); return }
              navigate('/checkout')
            }}
            disabled={!canCheckout}
            className="flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 btn-ripple"
            style={canCheckout ? {
              background: 'linear-gradient(135deg, var(--green-dark), var(--green-mid))',
              color: '#fff',
              boxShadow: 'var(--shadow-sm)',
            } : {
              background: !store_open ? '#FEE2E2' : 'var(--bg-muted)',
              color: !store_open ? '#DC2626' : 'var(--text-light)',
              cursor: 'not-allowed',
            }}
          >
            {store_open ? <ShoppingBag size={17} /> : <Clock size={17} />}
            {store_open ? 'Proceed to Checkout' : 'Store Closed'}
          </button>
        </div>
      </div>

    </div>
  )
}
