import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { Home, ShoppingBag, ShoppingCart, Package, User, Leaf } from 'lucide-react'

// Auth
import { useAuthInit } from './hooks/useAuth'
import { useAuthStore } from './store/authStore'
import { useUiStore } from './store/uiStore'
import { useCartCount } from './store/cartStore'

// Customer pages
import HomeP from './pages/customer/Home'
import Shop from './pages/customer/Shop'
import ProductDetail from './pages/customer/ProductDetail'
import Cart from './pages/customer/Cart'
import Checkout from './pages/customer/Checkout'
import OrderSuccess from './pages/customer/OrderSuccess'
import OrderTracking from './pages/customer/OrderTracking'
import Orders from './pages/customer/Orders'
import Profile from './pages/customer/Profile'
import Auth from './pages/customer/Auth'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminOffers from './pages/admin/AdminOffers'
import AdminDelivery from './pages/admin/AdminDelivery'
import AdminSettings from './pages/admin/AdminSettings'

// Components
import BottomNav from './components/BottomNav'
import Onboarding from './components/Onboarding'

// ─── Admin guard ──────────────────────────────────────────────────────────────
function AdminGuard({ children }) {
  // 🔓 Temporary bypass for local development
  return children
}

// ─── Desktop Sidebar Nav ──────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/',        icon: Home,         label: 'Home',   exact: true },
  { to: '/shop',    icon: ShoppingBag,  label: 'Shop' },
  { to: '/cart',    icon: ShoppingCart, label: 'Cart',   isCart: true },
  { to: '/orders',  icon: Package,      label: 'Orders' },
  { to: '/profile', icon: User,         label: 'Profile' },
]

function DesktopSidebar() {
  const cartCount = useCartCount()
  const navigate = useNavigate()

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 cursor-pointer"
        style={{ paddingTop: 24, paddingBottom: 20 }}
        onClick={() => navigate('/')}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--brand-800), var(--brand-500))',
            boxShadow: '0 2px 8px rgba(22,163,74,.3)',
          }}
        >
          KR
        </div>
        <div>
          <h1
            className="text-base font-bold leading-tight tracking-tight"
            style={{ fontFamily: 'Playfair Display, serif', color: 'var(--brand-800)' }}
          >
            KR Vegetables
          </h1>
          <p className="text-xs font-medium leading-none mt-0.5" style={{ color: 'var(--brand-500)' }}>
            Farm to doorstep
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border-light)', margin: '0 16px' }} />

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 px-3 pt-4 flex-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact, isCart }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontWeight: isActive ? 600 : 500,
              fontSize: 14,
              color: isActive ? 'var(--brand-700)' : 'var(--text-mid)',
              background: isActive ? 'var(--brand-50)' : 'transparent',
              transition: 'background .15s, color .15s',
              letterSpacing: isActive ? '-.01em' : 0,
            })}
          >
            {({ isActive }) => (
              <>
                <span
                  className="relative flex items-center justify-center rounded-lg"
                  style={isActive ? {
                    width: 32, height: 32,
                    background: 'var(--brand-100)',
                  } : {
                    width: 32, height: 32,
                  }}
                >
                  <Icon
                    size={17}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    style={{ color: isActive ? 'var(--brand-600)' : 'var(--text-muted)' }}
                  />
                  {isCart && cartCount > 0 && (
                    <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
                  )}
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Promo box */}
      <div className="mx-3 mb-3 p-4 rounded-xl" style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}>
        <p className="text-xs font-bold mb-1" style={{ color: 'var(--brand-700)' }}>🚚 Free Delivery</p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--brand-600)' }}>
          Order above ₹299 and get free same-day delivery.
        </p>
      </div>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border-light)' }}>
        <div className="flex items-center gap-2">
          <Leaf size={13} style={{ color: 'var(--brand-500)' }} />
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            100% Fresh · Farm to Door
          </p>
        </div>
      </div>
    </aside>
  )
}

// ─── Customer Layout ──────────────────────────────────────────────────────────
function CustomerLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      <DesktopSidebar />
      <div className="app-main" style={{ flex: 1, minWidth: 0 }}>
        <div className="app-content">
          {children}
        </div>
      </div>
      {/* Mobile bottom nav (hidden on desktop via CSS) */}
      <BottomNav />
    </div>
  )
}

// ─── App Routes ───────────────────────────────────────────────────────────────
function AppRoutes() {
  useAuthInit()
  const location = useLocation()
  const { onboardingDone } = useUiStore()
  const { isOffline, setOffline } = useUiStore()

  useEffect(() => {
    const handleOnline  = () => setOffline(false)
    const handleOffline = () => setOffline(true)
    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!onboardingDone && !location.pathname.startsWith('/admin')) return <Onboarding />

  return (
    <Routes>
      {/* Customer routes */}
      <Route path="/"            element={<CustomerLayout><HomeP /></CustomerLayout>} />
      <Route path="/shop"        element={<CustomerLayout><Shop /></CustomerLayout>} />
      <Route path="/product/:id" element={<CustomerLayout><ProductDetail /></CustomerLayout>} />
      <Route path="/cart"        element={<CustomerLayout><Cart /></CustomerLayout>} />
      <Route path="/checkout"    element={<Checkout />} />
      <Route path="/order-success/:orderId" element={<OrderSuccess />} />
      <Route path="/track/:orderId"         element={<OrderTracking />} />
      <Route path="/orders"      element={<CustomerLayout><Orders /></CustomerLayout>} />
      <Route path="/profile"     element={<CustomerLayout><Profile /></CustomerLayout>} />
      <Route path="/auth"        element={<Auth />} />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
        <Route index          element={<AdminDashboard />} />
        <Route path="orders"     element={<AdminOrders />} />
        <Route path="products"   element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="offers"     element={<AdminOffers />} />
        <Route path="delivery"   element={<AdminDelivery />} />
        <Route path="settings"   element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1B1B1B',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px 16px',
            maxWidth: '320px',
          },
          success: { iconTheme: { primary: '#52B788', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#E76F51', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  )
}
