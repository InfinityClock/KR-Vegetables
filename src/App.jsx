import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { Home, ShoppingBag, ShoppingCart, Package, User, Leaf } from 'lucide-react'
import logoImg from './assets/logo.png'

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
        className="flex flex-col items-center px-5 cursor-pointer"
        style={{ paddingTop: 20, paddingBottom: 16 }}
        onClick={() => navigate('/')}
      >
        <img
          src={logoImg}
          alt="KR Vegetables & Fruits"
          style={{ height: 72, width: 'auto', objectFit: 'contain' }}
        />
        <p className="text-xs font-semibold mt-1" style={{ color: 'var(--teal-600)' }}>
          Precision in Freshness
        </p>
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
              fontWeight: isActive ? 600 : 400,
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              color: isActive ? 'var(--brand-800)' : 'var(--text-muted)',
              background: isActive ? 'var(--brand-50)' : 'transparent',
              transition: 'background .15s, color .15s',
              letterSpacing: isActive ? '-.01em' : 0,
            })}
          >
            {({ isActive }) => (
              <>
                <span
                  className="relative flex items-center justify-center rounded-lg"
                  style={{ width: 32, height: 32 }}
                >
                  <Icon
                    size={17}
                    strokeWidth={isActive ? 2.2 : 1.6}
                    style={{ color: isActive ? 'var(--brand-800)' : 'var(--text-light)' }}
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
      <div className="mx-3 mb-3 p-4" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--brand-600)', marginBottom: 4 }}>
          Free Delivery
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-muted)' }}>
          Order above ₹299 — same-day, free.
        </p>
      </div>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border-light)' }}>
        <div className="flex items-center gap-2">
          <Leaf size={12} style={{ color: 'var(--brand-400)' }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-light)' }}>
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

  if (!onboardingDone && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/order-success') && !location.pathname.startsWith('/track')) return <Onboarding />

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
