import { useState } from 'react'
import { Eye, X, Package, Phone, MapPin, Copy, Navigation, MessageCircle, Clock, Banknote, CreditCard, AlertTriangle } from 'lucide-react'
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
                        {addr.city}{addr.pincode ? ` — ${addr.pincode}` : ''}
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

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const { orders, loading, loadingMore, hasMore, refetch, loadMore } = useAdminOrders(statusFilter)
  const { userRole } = useAuthStore()

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await adminFetch('/api/admin-orders', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_status',
          orderId,
          newStatus,
          trackingMessage: ORDER_STATUS_MESSAGES[newStatus],
        }),
      })

      const result = await res.json()

      if (!res.ok || result.error) {
        toast.error('Failed to update: ' + (result.error || 'Unknown error'))
        return
      }

      toast.success(`Order marked as ${ORDER_STATUS[newStatus]?.label}`)
      refetch()
    } catch (err) {
      toast.error('Network error — ' + err.message)
    }
  }

  const tabs = ['all', ...Object.keys(ORDER_STATUS)]

  return (
    <div className="p-4 lg:p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dark)' }}
          >
            Orders
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''} {statusFilter !== 'all' ? `· ${ORDER_STATUS[statusFilter]?.label}` : ''}
          </p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 pb-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setStatusFilter(t)}
            className="flex-shrink-0 px-4 h-9 rounded-full text-xs font-semibold transition-all"
            style={
              statusFilter === t
                ? { background: 'var(--brand-700)', color: '#fff', border: '1.5px solid var(--brand-700)' }
                : { background: '#fff', color: 'var(--text-mid)', border: '1.5px solid var(--border)' }
            }
          >
            {t === 'all' ? 'All Orders' : ORDER_STATUS[t]?.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div
          className="rounded-2xl p-5"
          style={{ background: '#fff', border: '1px solid var(--border-light)' }}
        >
          <SkeletonList count={6} height="h-16" />
        </div>
      ) : orders.length === 0 ? (
        <div
          className="rounded-2xl py-16 flex flex-col items-center gap-3"
          style={{ background: '#fff', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}
        >
          <Package size={36} style={{ opacity: 0.3 }} />
          <p className="text-sm">No orders found</p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#fff', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
        >
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--border-light)' }}>
                <tr>
                  {['Order #', 'Customer', 'Items', ...(userRole !== 'sales' ? ['Total', 'Payment'] : []), 'Method', 'Status', 'Time', 'Action'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className="transition-colors"
                    style={{ borderBottom: idx < orders.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-50)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-dark)' }}>
                      {order.order_number}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: 'var(--text-dark)' }}>{order.customers?.full_name || 'N/A'}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{order.customers?.phone}</p>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-mid)' }}>
                      {order.order_items?.length > 0
                        ? `${order.order_items.length} item${order.order_items.length > 1 ? 's' : ''}`
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    {userRole !== 'sales' && (
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--brand-700)' }}>
                        {formatPrice(order.total_amount)}
                      </td>
                    )}
                    {userRole !== 'sales' && (
                      <td className="px-4 py-3"><PaymentStatusBadge status={order.payment_status} /></td>
                    )}
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-bold uppercase px-2 py-1 rounded-lg"
                        style={{
                          background: order.payment_method === 'cod' ? 'var(--gray-100)' : 'var(--brand-50)',
                          color: order.payment_method === 'cod' ? 'var(--text-mid)' : 'var(--brand-700)',
                        }}
                      >
                        {order.payment_method === 'cod' ? 'COD' : 'Online'}
                      </span>
                    </td>
                    <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatDateTime(order.placed_at)}
                    </td>
                    <td className="px-4 py-3">
                      {/* Quick actions: one-tap next-status button + details */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Next status — most common action, no modal needed */}
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (() => {
                          const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]
                          if (!nextStatus) return null
                          return (
                            <button
                              onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, nextStatus) }}
                              className="flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs font-semibold transition-all"
                              style={{ background: 'var(--brand-700)', color: '#fff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                              title={`Mark as ${ORDER_STATUS[nextStatus]?.label}`}
                            >
                              ✓ {ORDER_STATUS[nextStatus]?.label}
                            </button>
                          )
                        })()}
                        {/* Details button */}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: 'var(--gray-100)', border: 'none', cursor: 'pointer' }}
                          title="View Details"
                        >
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
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 cursor-pointer transition-colors"
                onClick={() => setSelectedOrder(order)}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-50)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>{order.order_number}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {order.customers?.full_name} · {formatDateTime(order.placed_at)}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    {userRole !== 'sales' && (
                      <span className="text-sm font-bold" style={{ color: 'var(--brand-700)' }}>
                        {formatPrice(order.total_amount)}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {order.order_items?.length > 0
                        ? `${order.order_items.length} item${order.order_items.length > 1 ? 's' : ''}`
                        : '—'}
                      {' '}· <span className="uppercase">{order.payment_method}</span>
                    </span>
                  </div>
                  {/* Quick next-status button on mobile */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (() => {
                    const next = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]
                    return next ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, next) }}
                        className="flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs font-semibold"
                        style={{ background: 'var(--brand-700)', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                      >
                        ✓ {ORDER_STATUS[next]?.label}
                      </button>
                    ) : null
                  })()}
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4 pb-2">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 h-10 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: loadingMore ? 'var(--gray-100)' : 'var(--brand-50)',
                  color: loadingMore ? 'var(--text-muted)' : 'var(--brand-700)',
                  border: '1.5px solid var(--brand-100)',
                  cursor: loadingMore ? 'wait' : 'pointer',
                }}
              >
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
    </div>
  )
}
