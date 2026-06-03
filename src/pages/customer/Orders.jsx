import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, Search, RefreshCw, ChevronRight, RotateCcw,
  Clock, CheckCircle2, XCircle, Truck, ShoppingBag,
  AlertTriangle, Phone,
} from 'lucide-react'
import { useSeo } from '../../hooks/useSeo'
import { useCustomerOrders } from '../../hooks/useOrders'
import { useCartStore } from '../../store/cartStore'
import { supabase } from '../../lib/supabase'
import { formatPrice, formatDateTime } from '../../utils/format'
import { ORDER_STATUS, PAYMENT_STATUS, WHATSAPP_NUMBER } from '../../constants'
import { PageTopBar } from '../../components/TopBar'
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/OrderStatusBadge'
import toast from 'react-hot-toast'

// ─── Status icon helper ──────────────────────────────────────────────────────
function StatusIcon({ status, size = 16 }) {
  const icons = {
    delivered:        <CheckCircle2 size={size} style={{ color: '#16a34a' }} />,
    cancelled:        <XCircle      size={size} style={{ color: '#dc2626' }} />,
    out_for_delivery: <Truck        size={size} style={{ color: '#7c3aed' }} />,
    placed:           <Clock        size={size} style={{ color: '#d97706' }} />,
    confirmed:        <Clock        size={size} style={{ color: '#2563eb' }} />,
    packing:          <Package      size={size} style={{ color: '#ea580c' }} />,
  }
  return icons[status] || <Clock size={size} style={{ color: 'var(--text-muted)' }} />
}

// ─── Tab definitions ─────────────────────────────────────────────────────────
const TABS = [
  { key: 'active',    label: 'Active',    statuses: ['placed', 'confirmed', 'packing', 'out_for_delivery'] },
  { key: 'past',      label: 'Completed', statuses: ['delivered'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['cancelled'] },
  { key: 'all',       label: 'All',       statuses: null },
]

// ─── Reorder logic ───────────────────────────────────────────────────────────
async function reorderItems(orderItems, addItem, navigate) {
  if (!orderItems?.length) { toast.error('No items to reorder.'); return }

  // Fetch current product state for all items in this order
  const productIds = orderItems.map(i => i.product_id).filter(Boolean)
  if (!productIds.length) {
    // No product IDs — just add by name (best effort)
    toast.error('Could not reorder. Product details are missing. Please add items manually.')
    return
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, name, unit, price, offer_price, image_url, stock_status, is_active')
    .in('id', productIds)

  const productMap = {}
  ;(products || []).forEach(p => { productMap[p.id] = p })

  let added = 0
  let skipped = []

  for (const item of orderItems) {
    const product = productMap[item.product_id]
    if (!product || !product.is_active) { skipped.push(item.product_name); continue }
    if (product.stock_status === 'out_of_stock') { skipped.push(item.product_name); continue }

    addItem(
      {
        id:             product.id,
        name:           product.name,
        unit:           product.unit,
        price:          product.offer_price ?? product.price,
        offer_price:    product.offer_price,
        original_price: product.offer_price ? product.price : null,
        image_url:      product.image_url,
      },
      item.quantity
    )
    added++
  }

  if (added === 0) {
    toast.error('All items from this order are currently out of stock.')
    return
  }

  if (skipped.length > 0) {
    toast(`Added ${added} item${added !== 1 ? 's' : ''} to cart. ${skipped.length} item${skipped.length !== 1 ? 's' : ''} skipped (out of stock).`, {
      icon: '⚠️', duration: 4000,
    })
  } else {
    toast.success(`${added} item${added !== 1 ? 's' : ''} added to your cart!`)
  }

  navigate('/cart')
}

// ─── Order card ──────────────────────────────────────────────────────────────
function OrderCard({ order, onReorder, reordering }) {
  const navigate  = useNavigate()
  const isCod     = order.payment_method === 'cod'
  const itemCount = order.order_items?.length ?? 0
  const preview   = (order.order_items || []).slice(0, 3).map(i => i.product_name).join(', ')
  const extra     = itemCount > 3 ? ` +${itemCount - 3} more` : ''

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xs)' }}
    >
      {/* Header row */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--gray-50)' }}
      >
        <div className="flex items-center gap-2">
          <StatusIcon status={order.status} size={14} />
          <span className="text-xs font-bold" style={{ color: 'var(--text-dark)', letterSpacing: '.02em' }}>
            #{order.order_number}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formatDateTime(order.placed_at)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        {/* Items preview */}
        {preview && (
          <p className="text-sm" style={{ color: 'var(--text-mid)', lineHeight: 1.5 }}>
            {preview}{extra && <span style={{ color: 'var(--text-muted)' }}>{extra}</span>}
          </p>
        )}

        {/* Delivery slot + address */}
        {order.delivery_slot && (
          <div className="flex items-center gap-1.5">
            <Clock size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{order.delivery_slot}</span>
            {order.addresses?.city && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                · {order.addresses.city}
              </span>
            )}
          </div>
        )}

        {/* Amount + payment */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: 'var(--brand-700)' }}>
              {formatPrice(order.total_amount)}
            </span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={isCod
                ? { background: '#FEF3C7', color: '#92400E' }
                : { background: '#DCFCE7', color: '#166534' }
              }
            >
              {isCod ? 'COD' : 'Paid Online'}
            </span>
            <PaymentStatusBadge status={order.payment_status} />
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex gap-2 px-4 py-3"
        style={{ borderTop: '1px solid var(--border-light)' }}
      >
        <button
          onClick={() => navigate(`/track/${order.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', border: '1.5px solid var(--brand-100)', cursor: 'pointer' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-700)'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--brand-50)'; e.currentTarget.style.color = 'var(--brand-700)' }}
        >
          <ChevronRight size={13} /> Track Order
        </button>
        <button
          onClick={() => onReorder(order.order_items)}
          disabled={reordering}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'var(--gray-100)', color: 'var(--text-mid)', border: '1px solid var(--border)', cursor: reordering ? 'wait' : 'pointer' }}
          onMouseEnter={(e) => { if (!reordering) { e.currentTarget.style.background = 'var(--text-dark)'; e.currentTarget.style.color = '#fff' } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; e.currentTarget.style.color = 'var(--text-mid)' }}
        >
          <RotateCcw size={13} style={{ animation: reordering ? 'spin 1s linear infinite' : 'none' }} />
          {reordering ? 'Adding…' : 'Reorder'}
        </button>
      </div>
    </div>
  )
}

// ─── Phone entry form ────────────────────────────────────────────────────────
function PhoneForm({ onSubmit, loading }) {
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const digits = value.replace(/\D/g, '').slice(-10)
    if (digits.length !== 10) { toast.error('Please enter a valid 10-digit mobile number.'); return }
    onSubmit(digits)
  }

  return (
    <div className="flex flex-col items-center px-6 pt-10 pb-6 gap-6">
      <div className="flex items-center justify-center rounded-full" style={{ width: 80, height: 80, background: 'var(--brand-50)', border: '2px solid var(--brand-100)' }}>
        <Package size={36} strokeWidth={1.5} style={{ color: 'var(--brand-700)' }} />
      </div>

      <div className="text-center space-y-1">
        <h2 className="font-bold text-xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dark)' }}>
          Your Order History
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)', maxWidth: 280, margin: '0 auto', lineHeight: 1.6 }}>
          Enter the mobile number you used when placing your orders.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full" style={{ maxWidth: 360 }}>
        <div className="flex flex-col gap-3">
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Phone size={13} /> +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile number"
              maxLength={10}
              required
              style={{
                width: '100%', height: 52, paddingLeft: 64, paddingRight: 16,
                borderRadius: 14, border: '1.5px solid var(--border)',
                background: 'var(--bg-card)', color: 'var(--text-dark)',
                fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--brand-600)' }}
              onBlur={(e)  => { e.target.style.borderColor = 'var(--border)' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 font-bold text-sm text-white btn-ripple"
            style={{
              height: 52, borderRadius: 14, border: 'none',
              background: loading ? 'var(--brand-400)' : 'var(--brand-800)',
              cursor: loading ? 'wait' : 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            <Search size={16} />
            {loading ? 'Looking up orders…' : 'View My Orders'}
          </button>
        </div>
      </form>

      <div
        className="w-full rounded-2xl p-4"
        style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', maxWidth: 360 }}
      >
        <p className="text-xs text-center" style={{ color: 'var(--brand-700)', lineHeight: 1.6 }}>
          🔒 We use your phone number to find your orders. No account needed.
        </p>
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function Orders() {
  useSeo({ title: 'My Orders', description: 'View your KR Vegetables & Fruits order history and reorder easily.' })

  const navigate  = useNavigate()
  const addItem   = useCartStore((s) => s.addItem)

  const {
    customerName, orders, hasMore, total,
    loading, loadingMore, autoLoading, error, verified,
    lookup, loadMore, reset,
  } = useCustomerOrders()

  // While auto-loading (phone detected from localStorage), show skeleton
  // immediately and bypass the phone form entirely
  const isAutoLoading = autoLoading || (loading && !verified)

  const [tab,        setTab]        = useState('all')
  const [reordering, setReordering] = useState(null)  // orderId being reordered
  const [trackInput, setTrackInput] = useState('')
  const [tracking,   setTracking]   = useState(false)

  // Filter orders by tab
  const tabDef    = TABS.find(t => t.key === tab)
  const displayed = tabDef?.statuses
    ? orders.filter(o => tabDef.statuses.includes(o.status))
    : orders

  // Tab counts
  const counts = {}
  TABS.forEach(t => {
    counts[t.key] = t.statuses
      ? orders.filter(o => t.statuses.includes(o.status)).length
      : orders.length
  })

  const handleReorder = useCallback(async (orderItems) => {
    const orderId = orderItems?.[0]?.order_id
    setReordering(orderId)
    await reorderItems(orderItems, addItem, navigate)
    setReordering(null)
  }, [addItem, navigate])

  const handleTrackSubmit = async (e) => {
    e.preventDefault()
    const num = trackInput.trim().toUpperCase()
    if (!num) { toast.error('Please enter your order number'); return }
    setTracking(true)
    try {
      const res  = await fetch(`/api/track-order?orderNumber=${encodeURIComponent(num)}`)
      const data = await res.json()
      if (!res.ok || !data?.id) { toast.error('Order not found. Check the number and try again.'); return }
      navigate(`/track/${data.id}`)
    } catch { toast.error('Could not look up order. Please try again.') }
    finally  { setTracking(false) }
  }

  return (
    <div className="pb-nav page-enter" style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>
      <PageTopBar
        title="My Orders"
        showBack={false}
        rightAction={(verified || isAutoLoading) ? (
          <button
            onClick={reset}
            className="text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ color: 'var(--text-muted)', background: 'var(--gray-100)', border: 'none', cursor: 'pointer' }}
          >
            Switch number
          </button>
        ) : null}
      />

      {/* ── Auto-loading skeleton — shown while auto-detecting from localStorage ── */}
      {isAutoLoading && (
        <div className="px-4 pt-6 space-y-4">
          <div style={{ height: 28, width: 160 }} className="skeleton rounded-lg" />
          <div style={{ height: 12, width: 100 }} className="skeleton rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton rounded-2xl" style={{ height: 148 }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Phone entry — only shown when no saved phone and not auto-loading ── */}
      {!verified && !isAutoLoading && (
        <>
          <PhoneForm onSubmit={lookup} loading={loading} />

          {/* Divider */}
          <div style={{ maxWidth: 360, margin: '0 auto 0', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or track a specific order</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
            </div>
          </div>

          {/* Track by order number */}
          <form onSubmit={handleTrackSubmit} style={{ maxWidth: 360, margin: '16px auto 32px', padding: '0 24px' }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                placeholder="Order number e.g. 1042"
                style={{
                  flex: 1, height: 44, padding: '0 14px', borderRadius: 12,
                  border: '1.5px solid var(--border)', background: 'var(--bg-card)',
                  color: 'var(--text-dark)', fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--brand-600)' }}
                onBlur={(e)  => { e.target.style.borderColor = 'var(--border)' }}
              />
              <button
                type="submit"
                disabled={tracking}
                style={{
                  height: 44, padding: '0 16px', borderRadius: 12, border: 'none',
                  background: 'var(--brand-800)', color: '#fff',
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
                  cursor: tracking ? 'wait' : 'pointer',
                }}
              >
                {tracking ? '…' : 'Track'}
              </button>
            </div>
          </form>
        </>
      )}

      {/* ── Error ── */}
      {error && (
        <div
          className="mx-4 mt-4 rounded-2xl p-4 flex items-start gap-3"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
        >
          <AlertTriangle size={16} style={{ color: '#DC2626', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#991B1B' }}>{error}</p>
            <button
              onClick={reset}
              className="text-xs font-medium mt-1"
              style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Try a different number →
            </button>
          </div>
        </div>
      )}

      {/* ── Order list ── */}
      {verified && !error && !isAutoLoading && (
        <div className="px-4 pt-4 space-y-4">

          {/* Greeting */}
          {customerName && (
            <div>
              <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dark)' }}>
                {customerName.split(' ')[0]}'s Orders
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {total > 0 ? `${total} order${total !== 1 ? 's' : ''} total` : 'No orders yet'}
              </p>
            </div>
          )}

          {/* Tabs */}
          {orders.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-semibold transition-all"
                  style={tab === t.key
                    ? { background: 'var(--brand-700)', color: '#fff', border: 'none', cursor: 'pointer' }
                    : { background: 'var(--bg-card)', color: 'var(--text-mid)', border: '1.5px solid var(--border)', cursor: 'pointer' }
                  }
                >
                  {t.label}
                  {counts[t.key] > 0 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={tab === t.key
                        ? { background: 'rgba(255,255,255,.2)', color: '#fff' }
                        : { background: 'var(--gray-100)', color: 'var(--text-muted)' }
                      }
                    >
                      {counts[t.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton rounded-2xl" style={{ height: 148 }} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && displayed.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div style={{ fontSize: 52 }}>
                {tab === 'active' ? '📦' : tab === 'cancelled' ? '❌' : '🛒'}
              </div>
              <div className="text-center">
                <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                  {orders.length === 0 ? 'No orders found' : `No ${tab === 'all' ? '' : tabDef?.label.toLowerCase()} orders`}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {orders.length === 0
                    ? 'We couldn\'t find any orders for this number.'
                    : `You have no ${tabDef?.label.toLowerCase()} orders.`}
                </p>
              </div>
              {orders.length === 0 && (
                <div className="flex flex-col gap-2 w-full" style={{ maxWidth: 280 }}>
                  <button
                    onClick={() => navigate('/shop')}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'var(--brand-800)', border: 'none', cursor: 'pointer' }}
                  >
                    <ShoppingBag size={15} /> Start Shopping
                  </button>
                  <button
                    onClick={reset}
                    className="w-full h-10 rounded-xl text-sm font-medium"
                    style={{ background: 'var(--gray-100)', color: 'var(--text-mid)', border: 'none', cursor: 'pointer' }}
                  >
                    Try a different number
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Order cards */}
          {!loading && displayed.length > 0 && (
            <>
              <div className="space-y-3">
                {displayed.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onReorder={handleReorder}
                    reordering={reordering === order.order_items?.[0]?.order_id}
                  />
                ))}
              </div>

              {/* Load more */}
              {hasMore && tab === 'all' && (
                <div className="flex justify-center pt-2 pb-4">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-6 h-10 rounded-xl text-sm font-semibold"
                    style={{
                      background: loadingMore ? 'var(--gray-100)' : 'var(--brand-50)',
                      color: loadingMore ? 'var(--text-muted)' : 'var(--brand-700)',
                      border: '1.5px solid var(--brand-100)',
                      cursor: loadingMore ? 'wait' : 'pointer',
                    }}
                  >
                    {loadingMore
                      ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Loading…</>
                      : 'Load more orders'
                    }
                  </button>
                </div>
              )}
            </>
          )}

          {/* WhatsApp support */}
          {verified && !loading && (
            <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: 22, flexShrink: 0 }}>💬</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: '#15803D' }}>Need help with an order?</p>
                <p className="text-xs" style={{ color: '#166534' }}>WhatsApp us for any support.</p>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
                target="_blank" rel="noreferrer"
                className="flex-shrink-0 px-3 h-8 flex items-center rounded-lg text-xs font-bold text-white"
                style={{ background: '#25D366', textDecoration: 'none' }}
              >
                Chat
              </a>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
