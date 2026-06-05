import { ORDER_STATUS, PAYMENT_STATUS, getPaymentBadge } from '../constants'

export function OrderStatusBadge({ status }) {
  const s = ORDER_STATUS[status] || { label: status, color: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>
      {s.label}
    </span>
  )
}

/**
 * Context-aware payment status badge.
 *
 * Pass `method` (payment_method from the order) to get the correct label:
 *   COD + pending  → "💵 Awaiting Cash"
 *   COD + paid     → "✅ Cash Collected"
 *   Online + paid  → "✅ Paid Online"
 *
 * Falls back to generic labels if method is omitted.
 */
export function PaymentStatusBadge({ status, method }) {
  const s = method
    ? getPaymentBadge(status, method)
    : (PAYMENT_STATUS[status] || { label: status, color: 'bg-gray-100 text-gray-600' })
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
      {s.label}
    </span>
  )
}
