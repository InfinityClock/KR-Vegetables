export const DELIVERY_SLOTS = [
  'Morning 7AM–10AM',
  'Afternoon 12PM–3PM',
  'Evening 5PM–8PM',
]

export const ORDER_STATUS = {
  placed: { label: 'Order Placed', color: 'bg-blue-100 text-blue-700', step: 0 },
  confirmed: { label: 'Confirmed', color: 'bg-yellow-100 text-yellow-700', step: 1 },
  packing: { label: 'Packing', color: 'bg-orange-100 text-orange-700', step: 2 },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-700', step: 3 },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', step: 4 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', step: -1 },
}

export const ORDER_STATUS_MESSAGES = {
  placed: 'Your order has been placed successfully! 🎉',
  confirmed: 'Great news! Your order has been confirmed by the store.',
  packing: 'Your fresh produce is being carefully picked and packed! 📦',
  out_for_delivery: 'Your order is on the way! 🚚 Our delivery partner is headed to you.',
  delivered: 'Delivered successfully! Thank you for shopping with KR Vegetables & Fruits. 🌱',
  cancelled: 'This order has been cancelled.',
}

export const ORDER_STATUS_ICONS = {
  placed: '📋',
  confirmed: '✅',
  packing: '📦',
  out_for_delivery: '🚚',
  delivered: '🏠',
  cancelled: '❌',
}

export const PAYMENT_STATUS = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Refunded', color: 'bg-blue-100 text-blue-700' },
}

export const STOCK_STATUS = {
  in_stock: { label: 'Fresh', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  limited: { label: 'Limited', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  out_of_stock: { label: 'Out of Stock', color: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
}

export const COLORS = {
  primary: '#2D6A4F',
  lightGreen: '#52B788',
  accent: '#F4A261',
  yellow: '#FEFAE0',
  terracotta: '#E76F51',
  text: '#1B1B1B',
  muted: '#6B7280',
  bg: '#FFFDF7',
  card: '#FFFFFF',
  border: '#E5E7EB',
}

export const MIN_ORDER_AMOUNT = 150
export const DELIVERY_FEE = 40
export const FREE_DELIVERY_THRESHOLD = 300

export const WHATSAPP_NUMBER = '+919876543210'

export const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80'

export const FRUIT_PLACEHOLDER = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80'
