import { useSeo } from '../../hooks/useSeo'
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageCircle, ArrowLeft, Package, Copy, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useOrder } from '../../hooks/useOrders'
import { formatDateTime, formatPrice } from '../../utils/format'
import { ORDER_STATUS, ORDER_STATUS_MESSAGES, ORDER_STATUS_ICONS, WHATSAPP_NUMBER } from '../../constants'
import { PLACEHOLDER_IMAGE } from '../../constants'
import { SkeletonList } from '../../components/Skeleton'
import { useCartStore } from '../../store/cartStore'

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
            isActive ? 'ring-4' : ''
          }`}
          style={{
            background: isDone
              ? 'var(--brand-700)'
              : isActive
              ? 'var(--brand-50)'
              : 'var(--bg-muted)',
            border: isActive ? '2px solid var(--brand-700)' : undefined,
            boxShadow: isDone ? '0 2px 8px rgba(36,83,58,0.25)' : undefined,
            ringColor: isActive ? 'var(--brand-100)' : undefined,
          }}
        >
          {ORDER_STATUS_ICONS[step]}
        </div>
        {step !== 'delivered' && (
          <div
            className="w-0.5 h-12 mt-1"
            style={{
              background: isDone && stepIndex < currentIndex ? 'var(--brand-700)' : 'var(--border)',
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-center gap-2 mb-0.5">
          <h4
            className="text-sm font-bold"
            style={{
              color: isDone ? 'var(--brand-700)' : 'var(--text-light)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {s.label}
          </h4>
          {isActive && (
            <span
              className="w-2 h-2 rounded-full pulse-ring"
              style={{ background: 'var(--brand-700)' }}
            />
          )}
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          {trackEntry?.message || ORDER_STATUS_MESSAGES[step]}
        </p>
        {trackEntry && (
          <p className="text-xs" style={{ color: 'var(--text-light)', fontFamily: 'var(--font-body)' }}>
            {formatDateTime(trackEntry.updated_at)}
          </p>
        )}
      </div>
    </div>
  )
}

export default function OrderTracking() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { order, tracking, loading } = useOrder(orderId)

  useSeo({
    title: order ? `Order ${order.order_number}` : 'Order Tracking',
    description: 'Track your KR Vegetables & Fruits order status in real-time.',
  })
  const addItem = useCartStore((s) => s.addItem)
  const [copied, setCopied] = useState(false)

  const isCancelled = order?.status === 'cancelled'
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi! I need help with my order ${order?.order_number} at KR Vegetables & Fruits.`
  )}`

  function handleCopyOrderNumber() {
    if (!order?.order_number) return
    // navigator.clipboard can be undefined in constrained in-app browsers
    // (e.g. opened from a WhatsApp share) even over HTTPS — same risk class
    // as the Notification API crash found elsewhere in this audit.
    if (!navigator.clipboard?.writeText) {
      toast.error(`Order number: ${order.order_number}`)
      return
    }
    navigator.clipboard.writeText(order.order_number).then(() => {
      setCopied(true)
      toast.success('Order number copied!')
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  function handleReorder() {
    if (!order?.order_items) return
    order.order_items.forEach((item) => {
      addItem({
        id: item.product_id,
        name: item.product_name,
        price: item.unit_price,
        unit: item.unit,
        image_url: item.products?.image_url,
      })
    })
    toast.success('Items added to cart!')
  }

  return (
    <div className="pb-nav min-h-screen page-enter" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3"
        style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <ArrowLeft size={18} style={{ color: 'var(--text-mid)' }} />
        </button>
        <div className="flex-1">
          <h1
            className="text-base font-bold"
            style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-body)' }}
          >
            Track Order
          </h1>
          {order && (
            <div className="flex items-center gap-1.5">
              <p
                className="text-xs"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
              >
                {order.order_number}
              </p>
              <button
                onClick={handleCopyOrderNumber}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--warm-100)' }}
                title="Copy order number"
              >
                <Copy size={13} style={{ color: copied ? 'var(--brand-700)' : 'var(--text-muted)' }} />
              </button>
            </div>
          )}
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
            <p style={{ color: 'var(--text-muted)' }}>Order not found</p>
          </div>
        ) : (
          <>
            {/* Status banner */}
            <div
              className="rounded-2xl p-4 text-center"
              style={{ background: isCancelled ? '#FEE2E2' : 'var(--brand-50)' }}
            >
              <div className="text-4xl mb-2">{ORDER_STATUS_ICONS[order.status]}</div>
              <h2
                className="text-lg font-bold"
                style={{
                  color: isCancelled ? '#DC2626' : 'var(--brand-700)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {ORDER_STATUS[order.status]?.label}
              </h2>
              <p
                className="text-sm mt-1"
                style={{ color: 'var(--text-mid)', fontFamily: 'var(--font-body)' }}
              >
                {ORDER_STATUS_MESSAGES[order.status]}
              </p>
            </div>

            {/* Tracking steps */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
              }}
            >
              <h3
                className="text-sm font-bold mb-4"
                style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-body)' }}
              >
                Order Timeline
              </h3>
              {isCancelled ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">❌</div>
                  <p className="text-sm font-semibold text-red-600">Order Cancelled</p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
                  >
                    {ORDER_STATUS_MESSAGES.cancelled}
                  </p>
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
              <div
                className="rounded-2xl p-4"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <h3
                  className="text-sm font-bold mb-3 flex items-center gap-2"
                  style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-body)' }}
                >
                  <Package size={16} style={{ color: 'var(--brand-700)' }} />
                  Items in this order
                </h3>
                <div className="space-y-3">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.products?.image_url || PLACEHOLDER_IMAGE}
                        alt={item.product_name}
                        className="w-12 h-12 rounded-xl object-cover"
                        style={{ background: 'var(--bg-muted)' }}
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
                      />
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium"
                          style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-body)' }}
                        >
                          {item.product_name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
                        >
                          {item.quantity} × {item.unit}
                        </p>
                      </div>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-body)' }}
                      >
                        {formatPrice(item.total_price)}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-3 pt-3 space-y-1 text-sm"
                  style={{ borderTop: '1px solid var(--border-light)' }}
                >
                  <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                    <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                    <span>Handling Charge</span>
                    <span>{formatPrice(order.delivery_fee)}</span>
                  </div>
                  <div
                    className="flex justify-between font-bold text-base"
                    style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-body)' }}
                  >
                    <span>Total</span>
                    <span style={{ color: 'var(--brand-700)' }}>{formatPrice(order.total_amount)}</span>
                  </div>
                </div>

                {/* Reorder button */}
                {!isCancelled && (
                  <button
                    onClick={handleReorder}
                    className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl font-semibold text-sm"
                    style={{
                      height: '44px',
                      background: 'var(--brand-50)',
                      color: 'var(--brand-700)',
                      border: '1px solid var(--brand-200)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    <RefreshCw size={15} />
                    Reorder
                  </button>
                )}
              </div>
            )}

            {/* Delivery address */}
            {order.addresses && (
              <div
                className="rounded-2xl p-4"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <h3
                  className="text-sm font-bold mb-2"
                  style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-body)' }}
                >
                  Delivery Address
                </h3>
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-mid)', fontFamily: 'var(--font-body)' }}
                >
                  {order.addresses.address_line1}
                  {order.addresses.address_line2 && `, ${order.addresses.address_line2}`}
                  <br />
                  {order.addresses.city}{order.addresses.pincode ? `, ${order.addresses.pincode}` : ''}
                </p>
                <p
                  className="text-xs font-medium mt-1"
                  style={{ color: 'var(--brand-700)', fontFamily: 'var(--font-body)' }}
                >
                  🕐 Window: {order.delivery_slot}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
