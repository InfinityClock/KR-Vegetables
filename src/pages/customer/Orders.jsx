import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useOrders } from '../../hooks/useOrders'
import { useAuthStore } from '../../store/authStore'
import { formatDate, formatPrice } from '../../utils/format'
import { OrderStatusBadge } from '../../components/OrderStatusBadge'
import { SkeletonOrderCard } from '../../components/Skeleton'
import EmptyState from '../../components/EmptyState'
import { PageTopBar } from '../../components/TopBar'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

function OrderCard({ order, onClick }) {
  const itemNames = order.order_items?.slice(0, 2).map((i) => i.product_name || i.products?.name).join(', ')
  const moreCount = (order.order_items?.length || 0) - 2

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-sm font-bold text-gray-900">{order.order_number}</p>
          <p className="text-xs text-gray-400">{formatDate(order.placed_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <p className="text-xs text-gray-500 mb-2 line-clamp-1">
        {itemNames}
        {moreCount > 0 && ` +${moreCount} more`}
      </p>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-base font-bold text-[#2D6A4F]">{formatPrice(order.total_amount)}</span>
          <span className="text-xs text-gray-400 ml-1">• {order.order_items?.length || 0} items</span>
        </div>
        <ChevronRight size={18} className="text-gray-400" />
      </div>
    </div>
  )
}

export default function Orders() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [filter, setFilter] = useState('all')
  const { orders, loading } = useOrders(filter)

  if (!user) {
    return (
      <div className="pb-nav min-h-screen bg-[#FFFDF7] page-enter">
        <PageTopBar title="My Orders" showBack={false} />
        <EmptyState
          icon="📦"
          title="Login to view orders"
          subtitle="Sign in with your phone number to see your order history"
          action={{ label: 'Login', onClick: () => navigate('/auth') }}
        />
      </div>
    )
  }

  return (
    <div className="pb-nav min-h-screen bg-[#FFFDF7] page-enter">
      <PageTopBar title="My Orders" showBack={false} />

      {/* Filter tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`flex-shrink-0 px-4 h-8 rounded-full text-xs font-semibold border transition-colors
              ${filter === value ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonOrderCard key={i} />)
        ) : orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title={filter === 'all' ? "No orders yet" : `No ${filter} orders`}
            subtitle="Your order history will appear here"
            action={{ label: 'Start Shopping', onClick: () => navigate('/shop') }}
          />
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => navigate(`/track/${order.id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}
