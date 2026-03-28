import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, TrendingUp, Clock, AlertTriangle, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatPrice, formatDateTime } from '../../utils/format'
import { OrderStatusBadge } from '../../components/OrderStatusBadge'
import { SkeletonList } from '../../components/Skeleton'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

function KPICard({ icon: Icon, label, value, sub, color, loading }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '20' }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      {loading ? (
        <>
          <div className="skeleton h-7 w-20 rounded mb-1" />
          <div className="skeleton h-4 w-28 rounded" />
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          {sub && <p className="text-xs font-medium mt-1" style={{ color }}>{sub}</p>}
        </>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()

    // Realtime for new orders
    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        loadDashboard()
        // Browser notification
        if (Notification.permission === 'granted') {
          new Notification('🛍️ New Order!', { body: 'A new order has been placed on KR Vegetables & Fruits', icon: '/logo.png' })
        }
      })
      .subscribe()

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => supabase.removeChannel(channel)
  }, [])

  const loadDashboard = async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [todayOrdersRes, pendingOrdersRes, lowStockRes, recentRes] = await Promise.all([
      supabase.from('orders').select('total_amount').gte('placed_at', today.toISOString()),
      supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['placed', 'confirmed']),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('stock_status', 'limited'),
      supabase.from('orders')
        .select('*, customers(full_name, phone), order_items(id)')
        .order('placed_at', { ascending: false })
        .limit(10),
    ])

    const todayOrders = todayOrdersRes.data || []
    const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)

    setStats({
      todayOrders: todayOrders.length,
      todayRevenue,
      pendingOrders: pendingOrdersRes.count || 0,
      lowStock: lowStockRes.count || 0,
    })
    setRecentOrders(recentRes.data || [])

    // Build chart: last 7 days revenue
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      days.push({ date: d, next, label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) })
    }

    const chartRes = await supabase
      .from('orders')
      .select('total_amount, placed_at')
      .gte('placed_at', days[0].date.toISOString())
      .eq('payment_status', 'paid')

    const chartMap = {}
    days.forEach((d) => { chartMap[d.label] = 0 })
    ;(chartRes.data || []).forEach((o) => {
      const d = new Date(o.placed_at)
      const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      if (chartMap[label] !== undefined) chartMap[label] += Number(o.total_amount)
    })

    setChartData(days.map((d) => ({ label: d.label, revenue: chartMap[d.label] })))
    setLoading(false)
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back! Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          icon={Package}
          label="Today's Orders"
          value={stats?.todayOrders ?? '—'}
          color="#2D6A4F"
          loading={loading}
        />
        <KPICard
          icon={TrendingUp}
          label="Today's Revenue"
          value={stats ? formatPrice(stats.todayRevenue) : '—'}
          color="#52B788"
          loading={loading}
        />
        <KPICard
          icon={Clock}
          label="Pending Orders"
          value={stats?.pendingOrders ?? '—'}
          sub={stats?.pendingOrders > 0 ? 'Needs attention' : 'All clear!'}
          color="#F4A261"
          loading={loading}
        />
        <KPICard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={stats?.lowStock ?? '—'}
          sub={stats?.lowStock > 0 ? 'Update stock' : 'All good!'}
          color="#E76F51"
          loading={loading}
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h2 className="text-base font-bold text-gray-900 mb-4">Revenue — Last 7 Days</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(val) => [`₹${val}`, 'Revenue']} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2D6A4F"
                strokeWidth={2.5}
                dot={{ fill: '#2D6A4F', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No revenue data yet
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-sm text-[#2D6A4F] font-semibold flex items-center gap-1"
          >
            View all <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="p-4"><SkeletonList count={5} /></div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No orders yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate('/admin/orders')}
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{order.order_number}</p>
                  <p className="text-xs text-gray-500">
                    {order.customers?.full_name || 'Customer'} · {order.order_items?.length || 0} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#2D6A4F]">{formatPrice(order.total_amount)}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
