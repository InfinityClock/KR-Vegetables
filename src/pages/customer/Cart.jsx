import { useSeo } from '../../hooks/useSeo'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Minus, Plus, Trash2, ShoppingBag, Clock, Loader2 } from 'lucide-react'
import {
  useCartStore,
  useCartSubtotal,
  useCartHandlingFee,
  useCartTotal,
} from '../../store/cartStore'
import { formatPrice } from '../../utils/format'
import { PLACEHOLDER_IMAGE, getNextDeliveryWindow, HANDLING_CHARGE_RATE } from '../../constants'
import { useSettingsStore } from '../../store/settingsStore'
import { PageTopBar } from '../../components/TopBar'
import toast from 'react-hot-toast'

// ─── Cart Item ────────────────────────────────────────────────────────────────
function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCartStore()
  const displayPrice = item.price
  const hasOffer = item.original_price && item.original_price > item.price

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
              {formatPrice(item.original_price)}
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

// ─── Main Cart ────────────────────────────────────────────────────────────────
export default function Cart() {
  useSeo({ title: 'My Cart' })
  const navigate = useNavigate()
  const { items, notes, setNotes, clearCart, refreshPrices } = useCartStore()

  // ── Intercept back-navigation from Zoho payment page ─────────────────────
  // Detect the pending-payment state synchronously on first render so we can
  // immediately show a "Checking payment…" screen instead of a blank page.
  // kr-payment-active is set in Checkout.jsx just before redirecting to Zoho
  // and cleared once OrderSuccess renders the payment-failed screen.
  const [pendingPaymentRedirect] = useState(() => {
    try {
      return !!(
        sessionStorage.getItem('kr-payment-active') &&
        sessionStorage.getItem('kr-pending-order')
      )
    } catch { return false }
  })

  useEffect(() => {
    if (!pendingPaymentRedirect) return
    try {
      const raw = sessionStorage.getItem('kr-pending-order')
      if (!raw) return
      const { orderId } = JSON.parse(raw)
      if (orderId) {
        window.location.replace(`/order-success/${orderId}?payment=failed`)
      }
    } catch {}
  }, [pendingPaymentRedirect])
  const nextWindow   = getNextDeliveryWindow()
  const subtotal     = useCartSubtotal()
  const handlingFee  = useCartHandlingFee()
  const total        = useCartTotal()
  const { store_open } = useSettingsStore()
  const { handling_charge_rate } = useSettingsStore()
  const chargeRate   = Math.round((handling_charge_rate ?? HANDLING_CHARGE_RATE) * 100)

  // Pending payment redirect — show spinner immediately instead of blank
  if (pendingPaymentRedirect) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: 'var(--bg-base)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <Loader2 size={28} style={{ color: 'var(--green-mid)', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>
          Checking payment status…
        </p>
      </div>
    )
  }

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

  // Use total quantity throughout — matches the cart badge on the bottom nav,
  // which also shows total units (useCartCount). Consistent across the app.
  const itemCount  = items.reduce((s, i) => s + i.quantity, 0)

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

        {/* ── Left column: items + window + notes ── */}
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

          {/* Items */}
          <div className="flex flex-col gap-2.5">
            {items.map((item) => <CartItem key={item.id} item={item} />)}
          </div>

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
              onChange={(e) => setNotes(e.target.value.slice(0, 500))}
              placeholder="Any special instructions? (e.g. cut vegetables, extra fresh, etc.)"
              rows={3}
              maxLength={500}
              className="w-full text-sm outline-none resize-none rounded-xl p-3"
              style={{
                color: 'var(--text-dark)',
                background: 'var(--bg-muted)',
                border: '1px solid var(--border)',
              }}
            />
            {notes.length > 450 && (
              <p style={{ fontSize: 11, color: notes.length >= 500 ? '#dc2626' : 'var(--text-muted)', textAlign: 'right', marginTop: 2 }}>
                {notes.length}/500
              </p>
            )}
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
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-muted)' }}>
                  Handling Charge ({chargeRate}%)
                </span>
                <span style={{ color: 'var(--text-dark)' }}>{formatPrice(handlingFee)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
                <span className="font-semibold" style={{ color: 'var(--green-mid)' }}>FREE</span>
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

          {/* CTA — desktop only; mobile uses the sticky footer bar below */}
          <button
            onClick={() => {
              if (!store_open) { toast.error('Store is currently closed'); return }
              navigate('/checkout')
            }}
            disabled={!store_open}
            className="hidden lg:flex w-full h-14 rounded-2xl font-bold text-base items-center justify-center gap-2 btn-ripple"
            style={store_open ? {
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
              navigate('/checkout')
            }}
            disabled={!store_open}
            className="flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 btn-ripple"
            style={store_open ? {
              background: 'linear-gradient(135deg, var(--green-dark), var(--green-mid))',
              color: '#fff',
              boxShadow: 'var(--shadow-sm)',
            } : {
              background: '#FEE2E2',
              color: '#DC2626',
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
