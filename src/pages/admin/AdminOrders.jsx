import { useState, useRef, useCallback } from 'react'
import { Eye, X, Package, Phone, MapPin, Copy, Navigation, MessageCircle, Clock, Banknote, CreditCard, AlertTriangle, Search, Download, CheckSquare, Square, Filter, ChevronDown, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAdminOrders } from '../../hooks/useOrders'
import { formatDateTime, formatPrice } from '../../utils/format'
import { ORDER_STATUS, ORDER_STATUS_MESSAGES, STORE_LAT, STORE_LNG, DELIVERY_RADIUS_KM } from '../../constants'
import { haversineKm } from '../../utils/distance'
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/OrderStatusBadge'
import { SkeletonList } from '../../components/Skeleton'
import { adminFetch } from '../../lib/adminApi'
import toast from 'react-hot-toast'

const STATUS_FLOW = ['placed', 'confirmed', 'packing', 'out_for_delivery', 'delivered']

// ── Small helper: copy text to clipboard ─────────────────────────────────────
function CopyBtn({ text }) {
  const [done, setDone] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1500) }) }}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, color: done ? 'var(--brand-600)' : 'var(--text-light)', fontSize: 11 }}
      title="Copy"
    >
      {done ? '✓' : <Copy size={12} />}
    </button>
  )
}

function OrderDetailModal({ order, onClose, onStatusChange, userRole }) {
  if (!order) return null

  const phone   = order.customers?.phone
  const addr    = order.addresses
  const isCod   = order.payment_method === 'cod'

  // Compute delivery distance if coordinates are available
  const deliveryDistKm = addr?.lat && addr?.lng
    ? haversineKm(addr.lat, addr.lng, STORE_LAT, STORE_LNG)
    : null
  const distLabel = deliveryDistKm !== null
    ? deliveryDistKm < 1
      ? `${Math.round(deliveryDistKm * 1000)} m`
      : `${deliveryDistKm.toFixed(1)} km`
    : null
  const outsideRadius = deliveryDistKm !== null && deliveryDistKm > DELIVERY_RADIUS_KM

  // Build a Google Maps URL — use coordinates if available, else address string
  const mapsUrl = addr
    ? (addr.lat && addr.lng
        ? `https://www.google.com/maps?q=${addr.lat},${addr.lng}`
        : `https://www.google.com/maps/search/${encodeURIComponent(
            [addr.address_line1, addr.address_line2, addr.city, addr.pincode].filter(Boolean).join(', ')
          )}`)
    : null

  const fullAddress = addr
    ? [addr.address_line1, addr.address_line2, addr.city, addr.pincode].filter(Boolean).join(', ')
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(15,23,42,.6)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{ background: '#fff', boxShadow: 'var(--shadow-xl)' }}
      >
        {/* ── Sticky header ── */}
        <div
          className="sticky top-0 bg-white px-5 py-4 flex items-center justify-between rounded-t-3xl"
          style={{ borderBottom: '1px solid var(--border-light)', zIndex: 1 }}
        >
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base" style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-display)' }}>
                  {order.order_number}
                </h3>
                {/* Payment method badge — COD vs Online — always visible */}
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={isCod
                    ? { background: '#FEF3C7', color: '#92400E' }
                    : { background: '#DCFCE7', color: '#166534' }
                  }
                >
                  {isCod ? <Banknote size={10} /> : <CreditCard size={10} />}
                  {isCod ? 'COD' : 'Paid Online'}
                </span>
                {userRole !== 'sales' && <PaymentStatusBadge status={order.payment_status} />}
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatDateTime(order.placed_at)}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--gray-100)', border: 'none', cursor: 'pointer' }}>
            <X size={16} style={{ color: 'var(--text-mid)' }} />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* ── DELIVERY SECTION — #1 priority, largest visual weight ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '2px solid var(--brand-200)', background: 'var(--brand-50)' }}
          >
            {/* Customer name + phone */}
            <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--brand-100)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--brand-600)' }}>
                🚚 Delivery To
              </p>
              <p className="font-bold text-base" style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-display)' }}>
                {order.customers?.full_name || 'Customer'}
              </p>
              {phone && (
                <div className="flex items-center gap-2 mt-2">
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-sm font-semibold"
                    style={{ background: 'var(--brand-700)', color: '#fff', textDecoration: 'none' }}
                  >
                    <Phone size={13} /> {phone}
                  </a>
                  <a
                    href={`https://wa.me/${phone.replace(/\D/g, '')}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-sm font-semibold"
                    style={{ background: '#25D366', color: '#fff', textDecoration: 'none' }}
                  >
                    <MessageCircle size={13} /> WhatsApp
                  </a>
                  <CopyBtn text={phone} />
                </div>
              )}
            </div>

            {/* Full address */}
            {addr && (
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--brand-100)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <MapPin size={15} style={{ color: 'var(--brand-600)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>
                        {addr.address_line1}
                      </p>
                      {addr.address_line2 && (
                        <p className="text-sm" style={{ color: 'var(--text-mid)' }}>{addr.address_line2}</p>
                      )}
                      <p className="text-sm" style={{ color: 'var(--text-mid)' }}>
                        {addr.city}{addr.pincode ? `, ${addr.pincode}` : ''}
                      </p>
                    </div>
                  </div>
                  <CopyBtn text={fullAddress} />
                </div>
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold"
                      style={{ background: '#EFF6FF', color: '#1D4ED8', textDecoration: 'none', border: '1px solid #BFDBFE' }}
                    >
                      <Navigation size={12} /> Open in Google Maps
                    </a>
                  )}
                  {distLabel && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 h-8 rounded-lg text-xs font-bold"
                      style={outsideRadius
                        ? { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }
                        : { background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }
                      }
                      title={outsideRadius ? `Outside ${DELIVERY_RADIUS_KM}km radius` : `Within ${DELIVERY_RADIUS_KM}km radius`}
                    >
                      {outsideRadius ? '⚠️' : '📍'} {distLabel}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Delivery slot */}
            <div className="px-4 py-3 flex items-center gap-2">
              <Clock size={14} style={{ color: 'var(--brand-600)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--brand-800)' }}>
                {order.delivery_slot || 'No slot specified'}
              </span>
            </div>
          </div>

          {/* ── Customer notes — highlighted warning if present ── */}
          {order.notes && (
            <div className="rounded-xl p-3.5 flex gap-3" style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A' }}>
              <AlertTriangle size={16} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: '#92400E' }}>Customer Note</p>
                <p className="text-sm font-medium" style={{ color: '#78350F', lineHeight: 1.5 }}>{order.notes}</p>
              </div>
            </div>
          )}

          {/* ── Order Items ── */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-light)' }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--border-light)' }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Order Items
              </p>
              {order.order_items?.length > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--brand-100)', color: 'var(--brand-700)' }}>
                  {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {order.order_items?.length > 0 ? (
              <div>
                {order.order_items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex justify-between items-center px-4 py-2.5 text-sm"
                    style={{ borderBottom: idx < order.order_items.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                  >
                    <span style={{ color: 'var(--text-dark)', fontWeight: 500 }}>
                      {item.product_name}
                      <span className="ml-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        × {item.quantity} {item.unit}
                      </span>
                    </span>
                    {userRole !== 'sales' && item.total_price != null && (
                      <span className="font-semibold" style={{ color: 'var(--brand-700)' }}>
                        {formatPrice(item.total_price)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-3 text-sm italic" style={{ color: 'var(--text-muted)' }}>No item details available.</p>
            )}
          </div>

          {/* ── Totals ── */}
          {userRole !== 'sales' && (
            <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--gray-50)', border: '1px solid var(--border-light)' }}>
              <div className="flex justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                <span>Handling Charge</span><span>{formatPrice(order.delivery_fee)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2"
                style={{ borderTop: '1px solid var(--border)', color: 'var(--text-dark)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--brand-700)' }}>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          )}

          {/* ── Update Status ── */}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Update Status</p>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_FLOW.slice(STATUS_FLOW.indexOf(order.status) + 1).map((s) => (
                  <button
                    key={s}
                    onClick={() => { onStatusChange(order.id, s); onClose() }}
                    className="h-10 rounded-xl text-xs font-semibold transition-all"
                    style={{ border: '1.5px solid var(--brand-300)', color: 'var(--brand-700)', background: 'var(--brand-50)', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-700)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--brand-50)'; e.currentTarget.style.color = 'var(--brand-700)' }}
                  >
                    Mark as {ORDER_STATUS[s]?.label}
                  </button>
                ))}
                {userRole !== 'sales' && (
                  <button
                    onClick={() => { onStatusChange(order.id, 'cancelled'); onClose() }}
                    className="h-10 rounded-xl text-xs font-semibold transition-all"
                    style={{ border: '1.5px solid #FCA5A5', color: '#DC2626', background: '#FEF2F2', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626' }}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Safe helper — replaces the IIFE pattern in JSX which can miscompile in Rolldown/Vite 8
// production builds and throw "Objects are not valid as React child".
function NextStatusButton({ order, onUpdate }) {
  if (order.status === 'delivered' || order.status === 'cancelled') return null
  const currentIdx  = STATUS_FLOW.indexOf(order.status)
  const nextStatus  = currentIdx >= 0 ? STATUS_FLOW[currentIdx + 1] : null
  if (!nextStatus || nextStatus === 'delivered' && order.status === 'out_for_delivery') {
    // still show delivered button when out_for_delivery
  }
  if (!nextStatus) return null
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onUpdate(order.id, nextStatus) }}
      className="flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs font-semibold transition-all"
      style={{ background: 'var(--brand-700)', color: '#fff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
      title={`Mark as ${ORDER_STATUS[nextStatus]?.label ?? nextStatus}`}
    >
      ✓ {ORDER_STATUS[nextStatus]?.label ?? nextStatus}
    </button>
  )
}

// ── CSV export helper ────────────────────────────────────────────────────────
function exportOrdersCSV(orders) {
  const headers = [
    'Order #', 'Date', 'Customer', 'Phone', 'Address', 'City', 'Pincode',
    'Delivery Slot', 'Payment Method', 'Payment Status', 'Order Status',
    'Items', 'Subtotal', 'Handling', 'Total',
  ]
  const rows = orders.map(o => [
    o.order_number,
    o.placed_at ? new Date(o.placed_at).toLocaleString('en-IN') : '',
    o.customers?.full_name || '',
    o.customers?.phone || '',
    [o.addresses?.address_line1, o.addresses?.address_line2].filter(Boolean).join(', '),
    o.addresses?.city || '',
    o.addresses?.pincode || '',
    o.delivery_slot || '',
    o.payment_method || '',
    o.payment_status || '',
    o.status || '',
    (o.order_items || []).map(i => `${i.product_name}×${i.quantity}${i.unit}`).join('; '),
    o.subtotal ?? '',
    o.delivery_fee ?? '',
    o.total_amount ?? '',
  ])

  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Chip filter button ────────────────────────────────────────────────────────
function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 32, padding: '0 12px', borderRadius: 99, flexShrink: 0,
        fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        border: active ? 'none' : '1.5px solid var(--border)',
        background: active ? 'var(--brand-800)' : 'var(--bg-card)',
        color: active ? '#fff' : 'var(--text-mid)',
      }}
    >
      {label}
    </button>
  )
}

export default function AdminOrders() {
  // ── Filter state ─────────────────────────────────────────────────────────
  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [dateFilter,    setDateFilter]    = useState('all')
  const [slotFilter,    setSlotFilter]    = useState('all')

  const [selectedOrder,  setSelectedOrder]  = useState(null)
  const [selected,       setSelected]       = useState(new Set())  // bulk selection
  const [bulkStatus,     setBulkStatus]     = useState('')
  const [bulkLoading,    setBulkLoading]    = useState(false)
  const searchRef = useRef(null)

  const { userRole } = useAuthStore()
  const {
    orders, loading, loadingMore, hasMore, totalCount, error, refetch, loadMore,
  } = useAdminOrders({ statusFilter, search, paymentFilter, dateFilter, slotFilter })

  const hasActiveFilters = search || statusFilter !== 'all' || paymentFilter !== 'all' ||
    dateFilter !== 'all' || slotFilter !== 'all'

  const clearAllFilters = () => {
    setSearch(''); setStatusFilter('all'); setPaymentFilter('all')
    setDateFilter('all'); setSlotFilter('all'); setSelected(new Set())
  }

  // ── Status update ─────────────────────────────────────────────────────────
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      const res = await adminFetch('/api/admin-orders', {
        method: 'POST',
        body: JSON.stringify({ action: 'update_status', orderId, newStatus, trackingMessage: ORDER_STATUS_MESSAGES[newStatus] }),
      })
      const result = await res.json()
      if (!res.ok || result.error) { toast.error('Failed: ' + (result.error || 'Unknown')); return }
      toast.success(`Marked as ${ORDER_STATUS[newStatus]?.label}`)
      refetch()
    } catch (err) { toast.error('Network error: ' + err.message) }
  }, [refetch])

  // ── Bulk status update ────────────────────────────────────────────────────
  const applyBulkStatus = async () => {
    if (!bulkStatus || selected.size === 0) return
    setBulkLoading(true)
    const ids = [...selected]
    await Promise.all(ids.map(id => updateOrderStatus(id, bulkStatus)))
    setSelected(new Set())
    setBulkStatus('')
    setBulkLoading(false)
  }

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const toggleAll = () => {
    if (selected.size === orders.length) setSelected(new Set())
    else setSelected(new Set(orders.map(o => o.id)))
  }

  const statusTabs = ['all', ...Object.keys(ORDER_STATUS)]

  return (
    <div className="p-4 lg:p-6 max-w-7xl space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dark)' }}>
            Orders
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {totalCount != null ? `${totalCount} total` : `${orders.length} shown`}
            {hasActiveFilters && <span style={{ color: 'var(--brand-600)', fontWeight: 600 }}> · filtered</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="flex items-center gap-1 text-xs font-semibold px-3 h-8 rounded-lg"
              style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', cursor: 'pointer' }}>
              <X size={11} /> Clear filters
            </button>
          )}
          <button
            onClick={() => exportOrdersCSV(orders)}
            disabled={orders.length === 0}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 h-8 rounded-lg transition-all"
            style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', border: '1.5px solid var(--brand-100)', cursor: orders.length === 0 ? 'not-allowed' : 'pointer', opacity: orders.length === 0 ? 0.5 : 1 }}
          >
            <Download size={12} /> Export CSV
          </button>
          <button onClick={refetch} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gray-100)', border: 'none', cursor: 'pointer' }} title="Refresh">
            <RefreshCw size={13} style={{ color: 'var(--text-mid)' }} />
          </button>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div style={{ position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by order number, customer name or phone…"
          style={{
            width: '100%', height: 44, paddingLeft: 38, paddingRight: search ? 36 : 16,
            borderRadius: 12, border: '1.5px solid var(--border)',
            background: 'var(--bg-card)', fontFamily: 'var(--font-body)',
            fontSize: 13, color: 'var(--text-dark)', outline: 'none',
            boxShadow: '0 1px 4px rgba(28,26,23,.05)',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--brand-500)' }}
          onBlur={e =>  { e.target.style.borderColor = 'var(--border)' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Filter rows — 2 rows max ── */}
      {/* Row 1: Status tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
        {statusTabs.map(t => (
          <FilterChip key={t} label={t === 'all' ? 'All' : ORDER_STATUS[t]?.label} active={statusFilter === t} onClick={() => setStatusFilter(t)} />
        ))}
      </div>

      {/* Row 2: All secondary filters on one scrollable row — compact labels */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 items-center">
        {/* Payment */}
        {[['all', 'All pay'], ['cod', 'COD'], ['online', 'Online'], ['failed', 'Failed']].map(([k, l]) => (
          <FilterChip key={`pay-${k}`} label={l} active={paymentFilter === k} onClick={() => setPaymentFilter(k)} />
        ))}
        <div style={{ width: 1, height: 18, background: 'var(--border)', flexShrink: 0 }} />
        {/* Date */}
        {[['all', 'All dates'], ['today', 'Today'], ['yesterday', 'Yesterday'], ['week', 'This week'], ['month', 'This month']].map(([k, l]) => (
          <FilterChip key={`date-${k}`} label={l} active={dateFilter === k} onClick={() => setDateFilter(k)} />
        ))}
        <div style={{ width: 1, height: 18, background: 'var(--border)', flexShrink: 0 }} />
        {/* Slot */}
        {[['all', 'Any slot'], ['morning', 'Morning'], ['afternoon', 'Afternoon']].map(([k, l]) => (
          <FilterChip key={`slot-${k}`} label={l} active={slotFilter === k} onClick={() => setSlotFilter(k)} />
        ))}
      </div>

      {/* ── Bulk action bar (shown when rows are selected) ── */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--brand-50)', border: '1.5px solid var(--brand-100)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--brand-800)' }}>
            {selected.size} order{selected.size !== 1 ? 's' : ''} selected
          </span>
          <select
            value={bulkStatus}
            onChange={e => setBulkStatus(e.target.value)}
            style={{ height: 32, padding: '0 10px', borderRadius: 8, border: '1.5px solid var(--brand-300)', background: '#fff', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-dark)', cursor: 'pointer', outline: 'none' }}
          >
            <option value="">Update status to…</option>
            {STATUS_FLOW.map(s => <option key={s} value={s}>{ORDER_STATUS[s]?.label}</option>)}
          </select>
          <button
            onClick={applyBulkStatus}
            disabled={!bulkStatus || bulkLoading}
            className="flex items-center gap-1.5 text-xs font-bold px-4 h-8 rounded-lg"
            style={{ background: bulkStatus ? 'var(--brand-700)' : 'var(--gray-200)', color: bulkStatus ? '#fff' : 'var(--text-muted)', border: 'none', cursor: bulkStatus ? 'pointer' : 'not-allowed' }}
          >
            {bulkLoading ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            Apply to {selected.size}
          </button>
          <button onClick={() => setSelected(new Set())} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid var(--border-light)' }}>
          <SkeletonList count={6} height="h-16" />
        </div>
      ) : error ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: '#fff', border: '1px solid #FECACA' }}>
          <AlertTriangle size={32} style={{ color: '#DC2626', margin: '0 auto 8px' }} />
          <p className="text-sm font-semibold" style={{ color: '#991B1B' }}>{error}</p>
          <button onClick={refetch} className="mt-3 text-xs font-semibold px-4 py-2 rounded-lg" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', border: 'none', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl py-20 flex flex-col items-center gap-4" style={{ background: '#fff', border: '1px solid var(--border-light)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--brand-50)', border: '2px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {search ? <Search size={36} style={{ color: 'var(--brand-300)' }} /> : <Package size={36} style={{ color: 'var(--brand-300)' }} />}
          </div>
          <div className="text-center">
            <p className="text-base font-semibold" style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-display)' }}>
              {search ? `No orders matching "${search}"` : 'No orders found'}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {search ? 'Try a different name, phone number, or order ID.' : 'Orders placed by customers will appear here.'}
            </p>
          </div>
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="text-sm font-semibold px-5 py-2 rounded-xl" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', border: '1.5px solid var(--brand-100)', cursor: 'pointer' }}>
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--border-light)' }}>
                <tr>
                  {/* Select all */}
                  <th className="px-3 py-3 w-8">
                    <button onClick={toggleAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                      {selected.size === orders.length && orders.length > 0 ? <CheckSquare size={15} style={{ color: 'var(--brand-600)' }} /> : <Square size={15} />}
                    </button>
                  </th>
                  {['Order #', 'Customer', 'Items', ...(userRole !== 'sales' ? ['Total', 'Payment'] : []), 'Method', 'Status', 'Time', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className="transition-colors"
                    style={{
                      borderBottom: idx < orders.length - 1 ? '1px solid var(--border-light)' : 'none',
                      background: selected.has(order.id) ? 'var(--brand-25)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!selected.has(order.id)) e.currentTarget.style.background = 'var(--gray-50)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = selected.has(order.id) ? 'var(--brand-25)' : 'transparent' }}
                  >
                    <td className="px-3 py-3">
                      <button onClick={() => toggleSelect(order.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                        {selected.has(order.id) ? <CheckSquare size={15} style={{ color: 'var(--brand-600)' }} /> : <Square size={15} />}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-dark)' }}>{order.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: 'var(--text-dark)' }}>{order.customers?.full_name || '—'}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{order.customers?.phone || ''}</p>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-mid)' }}>
                      {(order.order_items?.length ?? 0) > 0 ? `${order.order_items.length} item${order.order_items.length > 1 ? 's' : ''}` : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    {userRole !== 'sales' && (
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--brand-700)' }}>{formatPrice(order.total_amount)}</td>
                    )}
                    {userRole !== 'sales' && (
                      <td className="px-4 py-3"><PaymentStatusBadge status={order.payment_status} /></td>
                    )}
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold uppercase px-2 py-1 rounded-lg" style={{ background: order.payment_method === 'cod' ? 'var(--gray-100)' : 'var(--brand-50)', color: order.payment_method === 'cod' ? 'var(--text-mid)' : 'var(--brand-700)' }}>
                        {order.payment_method === 'cod' ? 'COD' : 'Online'}
                      </span>
                    </td>
                    <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateTime(order.placed_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <NextStatusButton order={order} onUpdate={updateOrderStatus} />
                        <button onClick={() => setSelectedOrder(order)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gray-100)', border: 'none', cursor: 'pointer' }} title="View Details">
                          <Eye size={13} style={{ color: 'var(--text-mid)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y" style={{ borderColor: 'var(--border-light)' }}>
            {orders.map(order => (
              <div key={order.id} className="p-4 cursor-pointer transition-colors" onClick={() => setSelectedOrder(order)} onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-50)' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>{order.order_number}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{order.customers?.full_name} · {formatDateTime(order.placed_at)}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    {userRole !== 'sales' && <span className="text-sm font-bold" style={{ color: 'var(--brand-700)' }}>{formatPrice(order.total_amount)}</span>}
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {(order.order_items?.length ?? 0) > 0 ? `${order.order_items.length} item${order.order_items.length > 1 ? 's' : ''}` : '—'}{' '}· <span className="uppercase">{order.payment_method}</span>
                    </span>
                  </div>
                  <NextStatusButton order={order} onUpdate={updateOrderStatus} />
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4 pb-3">
              <button onClick={loadMore} disabled={loadingMore} className="flex items-center gap-2 px-6 h-10 rounded-xl text-sm font-semibold transition-all" style={{ background: loadingMore ? 'var(--gray-100)' : 'var(--brand-50)', color: loadingMore ? 'var(--text-muted)' : 'var(--brand-700)', border: '1.5px solid var(--brand-100)', cursor: loadingMore ? 'wait' : 'pointer' }}>
                {loadingMore ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {loadingMore ? 'Loading…' : 'Load more orders'}
              </button>
            </div>
          )}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={updateOrderStatus}
          userRole={userRole}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
