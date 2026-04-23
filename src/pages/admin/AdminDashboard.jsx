import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, TrendingUp, Clock, AlertTriangle, ChevronRight,
  ShoppingBag, RefreshCw, ArrowUpRight, Zap,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatPrice, formatDateTime } from '../../utils/format'
import { OrderStatusBadge } from '../../components/OrderStatusBadge'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts'

function KPICard({ icon: Icon, label, value, sub, accent, loading }) {
  return (
    <div
      className="bg-white rounded-2xl p-5 flex flex-col gap-3"
      style={{ border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: accent + '18' }}
        >
          <Icon size={20} style={{ color: accent }} />
        </div>
        <ArrowUpRight size={14} style={{ color: 'var(--text-light)', marginTop: 2 }} />
      </div>
      {loading ? (
        <>
          <div className="skeleton h-8 w-20 rounded-lg" />
          <div className="skeleton h-3.5 w-28 rounded" />
        </>
      ) : (
        <>
          <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-dark)', lineHeight: 1 }}>
            {value}
          </p>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
            {sub && (
              <p className="text-xs font-semibold mt-0.5" style={{ color: accent }}>
                {sub}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded-xl text-sm"
      style={{
        background: 'var(--brand-900)',
        color: '#fff',
        boxShadow: '0 4px 16px rgba(0,0,0,.2)',
        border: 'none',
      }}
    >
      <p className="font-bold">{payload[0].value > 0 ? formatPrice(payload[0].value) : '₹0'}</p>
      <p className="text-xs opacity-70">{label}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [chartData, setChartData] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()

    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        loadDashboard()
        if (Notification.permission === 'granted') {
          new Notification('🛍️ New Order!', {
            body: 'A new order has been placed on KR Vegetables & Fruits',
            icon: '/logo.png',
          })
        }
      })
      .subscribe()

    if (Notification.permission === 'default') Notification.requestPermission()

    return () => supabase.removeChannel(channel)
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [todayOrdersRes, pendingOrdersRes, lowStockRes, recentRes] = await Promise.all([
        supabase.from('orders').select('total_amount').gte('placed_at', today.toISOString()),
        supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['placed', 'confirmed']),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('stock_status', 'limited'),
        supabase.from('orders')
          .select('*, customers(full_name, phone), order_items(id)')
          .order('placed_at', { ascending: false })
          .limit(8),
      ])

      const firstError = todayOrdersRes.error || pendingOrdersRes.error || lowStockRes.error || recentRes.error
      if (firstError) {
        console.error('Dashboard fetch error:', firstError)
        setError(firstError.message)
        setLoading(false)
        return
      }

      setError(null)
      const todayOrders = todayOrdersRes.data || []
      const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)

      setStats({
        todayOrders: todayOrders.length,
        todayRevenue,
        pendingOrders: pendingOrdersRes.count || 0,
        lowStock: lowStockRes.count || 0,
      })
      setRecentOrders(recentRes.data || [])

      // Build last-7-days chart
      const days = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        d.setHours(0, 0, 0, 0)
        days.push({
          date: d,
          label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        })
      }

      const chartRes = await supabase
        .from('orders')
        .select('total_amount, placed_at')
        .gte('placed_at', days[0].date.toISOString())
        .eq('payment_status', 'paid')

      const chartMap = {}
      days.forEach((d) => { chartMap[d.label] = 0 })
      ;(chartRes.data || []).forEach((o) => {
        const label = new Date(o.placed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        if (chartMap[label] !== undefined) chartMap[label] += Number(o.total_amount)
      })

      setChartData(days.map((d) => ({ label: d.label, revenue: chartMap[d.label] })))
    } catch (err) {
      console.error('Dashboard exception:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="p-6 flex items-start justify-center min-h-[50vh]">
        <div
          className="w-full max-w-md rounded-2xl p-6 text-center"
          style={{ background: '#fff', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--red-50)' }}
          >
            <AlertTriangle size={28} style={{ color: 'var(--red-600)' }} />
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-display)' }}>
            Unable to load dashboard
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            There was a problem fetching dashboard data. This usually means a database permission issue.
          </p>
          <div
            className="text-xs font-mono text-left px-3 py-2.5 rounded-xl mb-5 break-all"
            style={{ background: 'var(--gray-50)', color: 'var(--text-mid)', border: '1px solid var(--border)' }}
          >
            {error}
          </div>
          <button
            onClick={() => { setError(null); loadDashboard() }}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--brand-700)' }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    )
  }

  const quickActions = [
    { label: 'View All Orders', icon: Package, to: '/admin/orders', color: 'var(--brand-600)' },
    { label: 'Manage Products', icon: ShoppingBag, to: '/admin/products', color: '#7C3AED' },
    { label: 'Active Offers', icon: Zap, to: '/admin/offers', color: '#D97706' },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dark)' }}
          >
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{
            background: 'var(--gray-100)',
            color: 'var(--text-mid)',
            border: '1px solid var(--border)',
          }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          icon={Package}
          label="Today's Orders"
          value={stats?.todayOrders ?? '—'}
          accent="var(--brand-600)"
          loading={loading}
        />
        <KPICard
          icon={TrendingUp}
          label="Today's Revenue"
          value={stats ? formatPrice(stats.todayRevenue) : '—'}
          accent="#7C3AED"
          loading={loading}
        />
        <KPICard
          icon={Clock}
          label="Pending Orders"
          value={stats?.pendingOrders ?? '—'}
          sub={stats?.pendingOrders > 0 ? 'Needs attention' : 'All clear!'}
          accent="#D97706"
          loading={loading}
        />
        <KPICard
          icon={AlertTriangle}
          label="Low Stock"
          value={stats?.lowStock ?? '—'}
          sub={stats?.lowStock > 0 ? 'Update inventory' : 'Fully stocked'}
          accent="#DC2626"
          loading={loading}
        />
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: '#fff', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>Revenue — Last 7 Days</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Paid orders only</p>
            </div>
            {stats && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}>
                {formatPrice(stats.todayRevenue)} today
              </span>
            )}
          </div>
          {loading ? (
            <div className="skeleton rounded-xl" style={{ height: 180 }} />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-600)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--brand-600)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-light)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-light)' }} tickFormatter={(v) => `₹${v}`} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--brand-600)"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  dot={{ fill: 'var(--brand-600)', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="rounded-xl flex items-center justify-center"
              style={{ height: 180, background: 'var(--gray-50)', color: 'var(--text-muted)', fontSize: 13 }}
            >
              No revenue data yet
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: '#fff', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
        >
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>Quick Actions</h2>
          <div className="flex flex-col gap-2 flex-1">
            {quickActions.map(({ label, icon: Icon, to, color }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-left transition-all group"
                style={{ background: 'var(--gray-50)', border: '1px solid var(--border-light)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--gray-50)' }}
              >
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: color + '18' }}
                >
                  <Icon size={16} style={{ color }} />
                </span>
                <span style={{ color: 'var(--text-dark)' }}>{label}</span>
                <ChevronRight size={14} className="ml-auto" style={{ color: 'var(--text-light)' }} />
              </button>
            ))}
          </div>
          {stats?.pendingOrders > 0 && (
            <div
              className="rounded-xl p-3 flex items-start gap-2"
              style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}
            >
              <Clock size={14} style={{ color: '#D97706', marginTop: 1, flexShrink: 0 }} />
              <p className="text-xs font-medium" style={{ color: '#92400E' }}>
                {stats.pendingOrders} order{stats.pendingOrders > 1 ? 's' : ''} waiting for confirmation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#fff', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-light)' }}
        >
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>Recent Orders</h2>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: 'var(--brand-600)' }}
          >
            View all <ChevronRight size={13} />
          </button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3.5 w-32 rounded" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div
            className="py-14 flex flex-col items-center gap-3"
            style={{ color: 'var(--text-muted)' }}
          >
            <Package size={32} style={{ opacity: 0.35 }} />
            <p className="text-sm">No orders yet</p>
          </div>
        ) : (
          <div>
            {recentOrders.map((order, idx) => (
              <div
                key={order.id}
                onClick={() => navigate('/admin/orders')}
                className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors"
                style={{
                  borderBottom: idx < recentOrders.length - 1 ? '1px solid var(--border-light)' : 'none',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-50)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'var(--brand-50)' }}
                >
                  <Package size={16} style={{ color: 'var(--brand-600)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-dark)' }}>
                    {order.order_number}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {order.customers?.full_name || 'Customer'} · {order.order_items?.length || 0} items
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold mb-1" style={{ color: 'var(--brand-700)' }}>
                    {formatPrice(order.total_amount)}
                  </p>
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
