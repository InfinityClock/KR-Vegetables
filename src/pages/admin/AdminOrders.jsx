import { useState } from 'react'
import { Eye, X, Package } from 'lucide-react'
import { useAdminOrders } from '../../hooks/useOrders'
import { formatDateTime, formatPrice } from '../../utils/format'
import { ORDER_STATUS, ORDER_STATUS_MESSAGES } from '../../constants'
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/OrderStatusBadge'
import { SkeletonList } from '../../components/Skeleton'
import toast from 'react-hot-toast'

const STATUS_FLOW = ['placed', 'confirmed', 'packing', 'out_for_delivery', 'delivered']

function OrderDetailModal({ order, onClose, onStatusChange }) {
  if (!order) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-3xl"
        style={{ background: '#fff', boxShadow: 'var(--shadow-xl)' }}
      >
        <div
          className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between rounded-t-3xl"
          style={{ borderBottom: '1px solid var(--border-light)', zIndex: 1 }}
        >
          <div>
            <h3 className="font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-display)' }}>
              {order.order_number}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatDateTime(order.placed_at)}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'var(--gray-100)' }}
          >
            <X size={16} style={{ color: 'var(--text-mid)' }} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Customer</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>{order.customers?.full_name || 'N/A'}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{order.customers?.phone}</p>
          </div>

          {/* Address */}
          {order.addresses && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Delivery Address</p>
              <p className="text-sm" style={{ color: 'var(--text-mid)' }}>
                {order.addresses.address_line1}
                {order.addresses.address_line2 && `, ${order.addresses.address_line2}`}<br />
                {order.addresses.city} — {order.addresses.pincode}
              </p>
              <p className="text-xs mt-1 font-medium" style={{ color: 'var(--brand-600)' }}>
                🕐 {order.delivery_slot}
              </p>
            </div>
          )}

          {/* Items */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Order Items
              {order.order_items?.length > 0 && (
                <span className="ml-1 font-normal normal-case" style={{ color: 'var(--text-light)' }}>
                  ({order.order_items.length})
                </span>
              )}
            </p>
            {order.order_items?.length > 0 ? (
              <div className="space-y-1.5">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm py-2"
                    style={{ borderBottom: '1px solid var(--border-light)' }}
                  >
                    <span style={{ color: 'var(--text-mid)' }}>
                      {item.product_name}
                      <span className="ml-1" style={{ color: 'var(--text-muted)' }}>× {item.quantity} {item.unit}</span>
                    </span>
                    <span className="font-semibold" style={{ color: 'var(--brand-700)' }}>
                      {formatPrice(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>No item details available.</p>
            )}
          </div>

          {/* Totals */}
          <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--gray-50)' }}>
            <div className="flex justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>Delivery</span><span>{formatPrice(order.delivery_fee)}</span>
            </div>
            <div
              className="flex justify-between font-bold text-base pt-2"
              style={{ borderTop: '1px solid var(--border)', color: 'var(--text-dark)' }}
            >
              <span>Total</span>
              <span style={{ color: 'var(--brand-700)' }}>{formatPrice(order.total_amount)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Payment:</span>
            <PaymentStatusBadge status={order.payment_status} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {order.payment_method === 'cod' ? '(Cash on Delivery)' : '(Online)'}
            </span>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-xl p-3" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#92400E' }}>Customer Note:</p>
              <p className="text-sm" style={{ color: '#78350F' }}>{order.notes}</p>
            </div>
          )}

          {/* Update Status */}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Update Status</p>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_FLOW.slice(STATUS_FLOW.indexOf(order.status) + 1).map((s) => (
                  <button
                    key={s}
                    onClick={() => { onStatusChange(order.id, s); onClose() }}
                    className="h-10 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      border: '1.5px solid var(--brand-300)',
                      color: 'var(--brand-700)',
                      background: 'var(--brand-50)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--brand-700)'
                      e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--brand-50)'
                      e.currentTarget.style.color = 'var(--brand-700)'
                    }}
                  >
                    Mark as {ORDER_STATUS[s]?.label}
                  </button>
                ))}
                <button
                  onClick={() => { onStatusChange(order.id, 'cancelled'); onClose() }}
                  className="h-10 rounded-xl text-xs font-semibold transition-all"
                  style={{ border: '1.5px solid #FCA5A5', color: '#DC2626', background: '#FEF2F2' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626' }}
                >
                  Cancel Order
                </button>
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
  const { orders, loading, refetch } = useAdminOrders(statusFilter)

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/admin-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
                  {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Method', 'Status', 'Time', 'Action'].map((h) => (
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
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--brand-700)' }}>
                      {formatPrice(order.total_amount)}
                    </td>
                    <td className="px-4 py-3"><PaymentStatusBadge status={order.payment_status} /></td>
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: 'var(--brand-50)' }}
                          title="View Details"
                        >
                          <Eye size={14} style={{ color: 'var(--brand-600)' }} />
                        </button>
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <select
                            value=""
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-xs rounded-lg px-2 py-1.5 outline-none transition-colors"
                            style={{
                              border: '1.5px solid var(--border)',
                              background: '#fff',
                              color: 'var(--text-mid)',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="">Update ▾</option>
                            {STATUS_FLOW.slice(STATUS_FLOW.indexOf(order.status) + 1).map((s) => (
                              <option key={s} value={s}>{ORDER_STATUS[s]?.label}</option>
                            ))}
                            <option value="cancelled">Cancel</option>
                          </select>
                        )}
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
                  <span className="text-sm font-bold" style={{ color: 'var(--brand-700)' }}>
                    {formatPrice(order.total_amount)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {order.order_items?.length > 0
                      ? `${order.order_items.length} item${order.order_items.length > 1 ? 's' : ''}`
                      : '—'}
                    {' '}· <span className="uppercase">{order.payment_method}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={updateOrderStatus}
        />
      )}
    </div>
  )
}
