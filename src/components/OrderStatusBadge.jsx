import { ORDER_STATUS, PAYMENT_STATUS } from '../constants'

export function OrderStatusBadge({ status }) {
  const s = ORDER_STATUS[status] || { label: status, color: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>
      {s.label}
    </span>
  )
}

export function PaymentStatusBadge({ status }) {
  const s = PAYMENT_STATUS[status] || { label: status, color: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
      {s.label}
    </span>
  )
}
