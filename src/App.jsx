import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { Home, ShoppingBag, ShoppingCart, Package, User, Leaf, Truck } from 'lucide-react'
import logoImg from './assets/Logo.jpg'

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
function AdminGuard() {
  const { isAdmin, loading } = useAuthStore()
  if (loading) return null
  if (!isAdmin) return <Navigate to="/admin/login" replace />
  return <Outlet />
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
    <aside
      className="app-sidebar"
      style={{
        background: 'linear-gradient(180deg, #0c1e12 0%, #112318 100%)',
        borderRight: 'none',
        boxShadow: '4px 0 32px rgba(0,0,0,.22)',
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex flex-col items-center cursor-pointer"
        style={{ padding: '16px 16px 14px', borderBottom: '1px solid rgba(255,255,255,.1)' }}
        onClick={() => navigate('/')}
      >
        <div
          style={{
            width: 88, height: 88,
            borderRadius: 14,
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 10,
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,.35)',
          }}
        >
          <img
            src={logoImg}
            alt="KR Vegetables & Fruits"
            style={{ width: 84, height: 84, objectFit: 'contain' }}
          />
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,.9)', letterSpacing: '-.01em', textAlign: 'center', lineHeight: 1.3 }}>
          KR Vegetables
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'rgba(255,255,255,.45)', marginTop: 2 }}>
          & Fruits
        </p>
      </div>

      {/* ── Nav links ── */}
      <nav className="flex flex-col gap-1 px-3 pt-4 flex-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact, isCart }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 14px',
              borderRadius: 12,
              textDecoration: 'none',
              fontWeight: isActive ? 600 : 500,
              fontSize: 14,
              fontFamily: 'var(--font-body)',
              color: isActive ? '#fff' : 'rgba(255,255,255,.82)',
              background: isActive ? 'rgba(255,255,255,.12)' : 'transparent',
              transition: 'background .15s, color .15s',
              letterSpacing: '-.01em',
            })}
          >
            {({ isActive }) => (
              <>
                <span
                  className="relative flex items-center justify-center rounded-xl"
                  style={{
                    width: 34, height: 34,
                    background: isActive ? 'rgba(255,255,255,.12)' : 'transparent',
                    flexShrink: 0,
                    transition: 'background .15s',
                  }}
                >
                  <Icon
                    size={17}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    style={{ color: isActive ? '#fff' : 'rgba(255,255,255,.72)' }}
                  />
                  {isCart && cartCount > 0 && (
                    <span
                      style={{
                        position: 'absolute', top: -3, right: -3,
                        background: 'var(--teal-500)',
                        color: '#fff', fontSize: '9px', fontWeight: 700,
                        minWidth: 16, height: 16,
                        borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 3px',
                        border: '2px solid #0c1e12',
                      }}
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Promo box ── */}
      <div
        className="mx-3 mb-3 p-4"
        style={{
          background: 'rgba(255,255,255,.06)',
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 14,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Truck size={14} style={{ color: 'var(--teal-400)' }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--teal-400)' }}>
            Free Delivery
          </p>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', lineHeight: 1.55, color: 'rgba(255,255,255,.72)' }}>
          Order above ₹299 — same-day, free.
        </p>
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <div className="flex items-center gap-2">
          <Leaf size={12} style={{ color: 'rgba(255,255,255,.45)' }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(255,255,255,.45)' }}>
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
      <Route element={<AdminGuard />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index             element={<AdminDashboard />} />
          <Route path="orders"     element={<AdminOrders />} />
          <Route path="products"   element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="offers"     element={<AdminOffers />} />
          <Route path="delivery"   element={<AdminDelivery />} />
          <Route path="settings"   element={<AdminSettings />} />
        </Route>
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
            background: '#1a1a1a',
            color: '#fff',
            borderRadius: '14px',
            fontSize: '13.5px',
            padding: '12px 18px',
            maxWidth: '320px',
            boxShadow: '0 8px 32px rgba(0,0,0,.25)',
          },
          success: { iconTheme: { primary: '#52B788', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#E76F51', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  )
}
