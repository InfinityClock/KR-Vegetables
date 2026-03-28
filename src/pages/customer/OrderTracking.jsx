import { useParams, useNavigate } from 'react-router-dom'
import { MessageCircle, ArrowLeft, Package } from 'lucide-react'
import { useOrder } from '../../hooks/useOrders'
import { formatDateTime, formatPrice } from '../../utils/format'
import { ORDER_STATUS, ORDER_STATUS_MESSAGES, ORDER_STATUS_ICONS, WHATSAPP_NUMBER } from '../../constants'
import { PLACEHOLDER_IMAGE } from '../../constants'
import { SkeletonList } from '../../components/Skeleton'

const STEPS = ['placed', 'confirmed', 'packing', 'out_for_delivery', 'delivered']

function TrackingStep({ step, status, tracking, isCancelled, currentStep }) {
  const stepIndex = STEPS.indexOf(step)
  const currentIndex = STEPS.indexOf(currentStep)
  const isDone = isCancelled ? false : stepIndex <= currentIndex
  const isActive = !isCancelled && stepIndex === currentIndex
  const trackEntry = tracking.find((t) => t.status === step)
  const s = ORDER_STATUS[step]

  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 z-10 transition-all ${
            isDone
              ? 'bg-[#2D6A4F] shadow-md'
              : isActive
              ? 'bg-[#2D6A4F]/20 border-2 border-[#2D6A4F]'
              : 'bg-gray-100'
          } ${isActive ? 'ring-4 ring-[#2D6A4F]/20' : ''}`}
        >
          {ORDER_STATUS_ICONS[step]}
        </div>
        {step !== 'delivered' && (
          <div className={`w-0.5 h-12 mt-1 ${isDone && stepIndex < currentIndex ? 'bg-[#2D6A4F]' : 'bg-gray-200'}`} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className={`text-sm font-bold ${isDone ? 'text-[#2D6A4F]' : 'text-gray-400'}`}>
            {s.label}
          </h4>
          {isActive && (
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F] pulse-green" />
          )}
        </div>
        <p className="text-xs text-gray-500 mb-1">
          {trackEntry?.message || ORDER_STATUS_MESSAGES[step]}
        </p>
        {trackEntry && (
          <p className="text-xs text-gray-400">{formatDateTime(trackEntry.updated_at)}</p>
        )}
      </div>
    </div>
  )
}

export default function OrderTracking() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { order, tracking, loading } = useOrder(orderId)

  const isCancelled = order?.status === 'cancelled'
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi! I need help with my order ${order?.order_number} at KR Vegetables & Fruits.`
  )}`

  return (
    <div className="pb-nav bg-[#FFFDF7] min-h-screen page-enter">
      {/* Header */}
      <header
        className="sticky top-0 z-40 bg-[#FFFDF7] px-4 py-3 flex items-center gap-3"
        style={{ borderBottom: '1px solid #E5E7EB' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-900">Track Order</h1>
          {order && <p className="text-xs text-gray-500">{order.order_number}</p>}
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center"
        >
          <MessageCircle size={18} className="text-white" />
        </a>
      </header>

      <div className="p-4 space-y-4">
        {loading ? (
          <SkeletonList count={5} height="h-20" />
        ) : !order ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Order not found</p>
          </div>
        ) : (
          <>
            {/* Status banner */}
            <div
              className="rounded-2xl p-4 text-center"
              style={{ background: isCancelled ? '#FEE2E2' : '#2D6A4F10' }}
            >
              <div className="text-4xl mb-2">{ORDER_STATUS_ICONS[order.status]}</div>
              <h2 className="text-lg font-bold" style={{ color: isCancelled ? '#DC2626' : '#2D6A4F' }}>
                {ORDER_STATUS[order.status]?.label}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{ORDER_STATUS_MESSAGES[order.status]}</p>
            </div>

            {/* Tracking steps */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Order Timeline</h3>
              {isCancelled ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">❌</div>
                  <p className="text-sm font-semibold text-red-600">Order Cancelled</p>
                  <p className="text-xs text-gray-500 mt-1">{ORDER_STATUS_MESSAGES.cancelled}</p>
                </div>
              ) : (
                STEPS.map((step) => (
                  <TrackingStep
                    key={step}
                    step={step}
                    status={order.status}
                    tracking={tracking}
                    isCancelled={isCancelled}
                    currentStep={order.status}
                  />
                ))
              )}
            </div>

            {/* Order items */}
            {order.order_items?.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Package size={16} className="text-[#2D6A4F]" />
                  Items in this order
                </h3>
                <div className="space-y-3">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.products?.image_url || PLACEHOLDER_IMAGE}
                        alt={item.product_name}
                        className="w-12 h-12 rounded-xl object-cover bg-gray-50"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} × {item.unit}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(item.total_price)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 mt-3 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span>
                    <span>{order.delivery_fee === 0 ? 'FREE' : formatPrice(order.delivery_fee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base">
                    <span>Total</span>
                    <span className="text-[#2D6A4F]">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery address */}
            {order.addresses && (
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Delivery Address</h3>
                <p className="text-sm text-gray-600">
                  {order.addresses.address_line1}
                  {order.addresses.address_line2 && `, ${order.addresses.address_line2}`}
                  <br />
                  {order.addresses.city} — {order.addresses.pincode}
                </p>
                <p className="text-xs text-[#2D6A4F] font-medium mt-1">🕐 Slot: {order.delivery_slot}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
