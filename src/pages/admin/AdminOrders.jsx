import { useState } from 'react'
import { Eye, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <h3 className="font-bold text-gray-900">{order.order_number}</h3>
            <p className="text-xs text-gray-500">{formatDateTime(order.placed_at)}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Customer */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Customer</h4>
            <p className="text-sm font-semibold">{order.customers?.full_name || 'N/A'}</p>
            <p className="text-sm text-gray-500">{order.customers?.phone}</p>
          </div>

          {/* Address */}
          {order.addresses && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Delivery Address</h4>
              <p className="text-sm text-gray-700">
                {order.addresses.address_line1}
                {order.addresses.address_line2 && `, ${order.addresses.address_line2}`}<br />
                {order.addresses.city} — {order.addresses.pincode}
              </p>
              <p className="text-xs text-[#2D6A4F] mt-1">🕐 {order.delivery_slot}</p>
            </div>
          )}

          {/* Items */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Order Items {order.order_items?.length > 0 && <span className="text-gray-400 font-normal normal-case">({order.order_items.length})</span>}
            </h4>
            {order.order_items?.length > 0 ? (
              <div className="space-y-2">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                    <span className="text-gray-700">{item.product_name} <span className="text-gray-400">× {item.quantity} {item.unit}</span></span>
                    <span className="font-medium text-[#2D6A4F]">{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No item details available for this order.</p>
            )}
          </div>

          {/* Totals */}
          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Delivery</span><span>{formatPrice(order.delivery_fee)}</span></div>
            <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-[#2D6A4F]">{formatPrice(order.total_amount)}</span></div>
          </div>

          {/* Payment */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Payment:</span>
            <PaymentStatusBadge status={order.payment_status} />
            <span className="text-xs text-gray-400">{order.payment_method === 'cod' ? '(COD)' : '(Online)'}</span>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-yellow-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-yellow-700 mb-1">Customer Note:</p>
              <p className="text-sm text-yellow-800">{order.notes}</p>
            </div>
          )}

          {/* Update Status */}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Update Status</h4>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_FLOW.slice(STATUS_FLOW.indexOf(order.status) + 1).map((s) => (
                  <button
                    key={s}
                    onClick={() => { onStatusChange(order.id, s); onClose() }}
                    className="h-10 border border-[#2D6A4F] rounded-xl text-xs font-semibold text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white transition-colors"
                  >
                    Mark as {ORDER_STATUS[s]?.label}
                  </button>
                ))}
                <button
                  onClick={() => { onStatusChange(order.id, 'cancelled'); onClose() }}
                  className="h-10 border border-red-300 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500 hover:text-white transition-colors"
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
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Orders</h1>
        <span className="text-sm text-gray-500">{orders.length} orders</span>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setStatusFilter(t)}
            className={`flex-shrink-0 px-3 h-8 rounded-full text-xs font-semibold border transition-colors
              ${statusFilter === t ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            {t === 'all' ? 'All' : ORDER_STATUS[t]?.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonList count={6} height="h-16" />
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No orders found</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Method', 'Status', 'Time', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">{order.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.customers?.full_name || 'N/A'}</p>
                      <p className="text-xs text-gray-400">{order.customers?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {order.order_items?.length > 0
                        ? `${order.order_items.length} item${order.order_items.length > 1 ? 's' : ''}`
                        : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#2D6A4F]">{formatPrice(order.total_amount)}</td>
                    <td className="px-4 py-3"><PaymentStatusBadge status={order.payment_status} /></td>
                    <td className="px-4 py-3"><span className="text-xs font-bold uppercase text-gray-500">{order.payment_method === 'cod' ? 'COD' : 'Online'}</span></td>
                    <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDateTime(order.placed_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="w-8 h-8 rounded-lg bg-[#2D6A4F]/10 flex items-center justify-center"
                        >
                          <Eye size={14} className="text-[#2D6A4F]" />
                        </button>
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <select
                            value=""
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none bg-white"
                          >
                            <option value="">Update</option>
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
          <div className="lg:hidden divide-y divide-gray-50">
            {orders.map((order) => (
              <div key={order.id} className="p-4" onClick={() => setSelectedOrder(order)}>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{order.order_number}</p>
                    <p className="text-xs text-gray-500">{order.customers?.full_name} · {formatDateTime(order.placed_at)}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-[#2D6A4F]">{formatPrice(order.total_amount)}</span>
                  <span className="text-xs text-gray-500">
                    {order.order_items?.length > 0
                      ? `${order.order_items.length} item${order.order_items.length > 1 ? 's' : ''}`
                      : '—'} · <span className="uppercase">{order.payment_method}</span>
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
