export const DELIVERY_WINDOWS = [
  { label: 'Morning',   time: '8AM – 1PM',  start: 8,  end: 13 },
  { label: 'Afternoon', time: '3PM – 8PM',  start: 15, end: 20 },
]

/**
 * Returns the next delivery window based on current local time.
 * Morning  08:00–13:00 → "Today, 8AM–1PM"
 * Afternoon 15:00–20:00 → "Today, 3PM–8PM"
 * After 20:00           → "Tomorrow, 8AM–1PM"
 */
export function getNextDeliveryWindow() {
  const now = new Date()
  const h = now.getHours()
  // Cutoff: noon for morning slot (gives team prep time)
  // Cutoff: 6 PM for afternoon slot — orders after 6 PM can't make the 3–8 PM window
  if (h < 12) return 'Today, 8AM–1PM'
  if (h < 18) return 'Today, 3PM–8PM'
  return 'Tomorrow, 8AM–1PM'
}

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
  out_for_delivery: 'Your order is on its way to you! 🚚',
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

export const HANDLING_CHARGE_RATE = 0.02   // 2% of cart subtotal

export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '+919176260992'

export const STORE_ADDRESS = '1/37, Thalambur Main Road, Mullai Nagar, Chennai – 600130'
export const STORE_MAPS_URL = 'https://maps.google.com/?q=1/37+Thalambur+Main+Road+Mullai+Nagar+Chennai+600130'

export const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80'

export const FRUIT_PLACEHOLDER = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80'
