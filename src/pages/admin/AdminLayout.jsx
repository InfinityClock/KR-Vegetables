import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Tags, Tag,
  Truck, Settings, Menu, X, LogOut, ChevronRight, Bell, Download,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import logoImg from '../../assets/Logo.jpg'
import InstallPrompt from '../../components/InstallPrompt'
import toast from 'react-hot-toast'

const ADMIN_INSTALL_BENEFITS = [
  'New order alerts',
  'Order management',
  'Inventory management',
  'Admin dashboard access',
]

/**
 * Android Chrome fires `beforeinstallprompt` when install criteria are met
 * (manifest + service worker + HTTPS). Capturing it lets us show our own
 * "Install App" button in the sidebar — a persistent manual fallback in
 * addition to the auto-popup (InstallPrompt) below, for admins who dismissed
 * the popup but want to install before the 7-day re-prompt window passes.
 * iOS never fires this event — the button simply does not render there.
 */
function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  return { canInstall: !!deferredPrompt, promptInstall }
}

const navItems = [
  { to: '/admin',                   icon: LayoutDashboard, label: 'Dashboard',     exact: true },
  { to: '/admin/orders',            icon: Package,         label: 'Orders'         },
  { to: '/admin/products',          icon: ShoppingBag,     label: 'Products'       },
  { to: '/admin/categories',        icon: Tags,            label: 'Categories'     },
  { to: '/admin/offers',            icon: Tag,             label: 'Offers'         },
  { to: '/admin/delivery',          icon: Truck,           label: 'Delivery'       },
  { to: '/admin/notifications',     icon: Bell,            label: 'Notifications'  },
  { to: '/admin/settings',          icon: Settings,        label: 'Settings'       },
]

function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const { logout, user, userRole } = useAuthStore()
  const { canInstall, promptInstall } = useInstallPrompt()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
    toast.success('Logged out')
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(15,23,42,.45)', backdropFilter: 'blur(2px)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-screen`}
        style={{
          width: 260,
          /* Green → Teal gradient — "Precision in Freshness" */
          background: 'linear-gradient(175deg, #052e16 0%, #0a4529 45%, #115e59 100%)',
          borderRight: '1px solid rgba(255,255,255,.06)',
        }}
      >
        {/* Logo — white-card treatment so it shows on dark bg */}
        <div
          className="flex flex-col items-center cursor-pointer"
          style={{
            padding: '20px 20px 16px',
            borderBottom: '1px solid rgba(255,255,255,.08)',
          }}
          onClick={() => { navigate('/admin'); onClose?.() }}
        >
          <div
            className="rounded-2xl p-2 mb-2"
            style={{
              background: 'rgba(255,255,255,.95)',
              boxShadow: '0 4px 16px rgba(0,0,0,.25)',
            }}
          >
            <img
              src={logoImg}
              alt="KR Vegetables & Fruits"
              style={{ height: 52, width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </div>
          <p
            className="text-xs font-semibold tracking-wide uppercase"
            style={{ color: 'rgba(255,255,255,.45)', letterSpacing: '.08em' }}
          >
            Admin Panel
          </p>
          <button onClick={onClose} className="lg:hidden absolute top-4 right-4" style={{ color: 'rgba(255,255,255,.5)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.filter(({ to }) => {
            if (userRole === 'sales') return !['/admin/offers', '/admin/settings', '/admin/delivery', '/admin/notifications'].includes(to)
            return true
          }).map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                 ${isActive ? 'text-white' : 'hover:text-white'}`
              }
              style={({ isActive }) => ({
                background: isActive
                  ? 'rgba(45,212,191,.18)'  /* teal-400 tint for active */
                  : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,.52)',
                borderLeft: isActive ? '2px solid rgba(45,212,191,.7)' : '2px solid transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: isActive ? 'rgba(45,212,191,.2)' : 'transparent',
                    }}
                  >
                    <Icon
                      size={16}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      style={{ color: isActive ? '#5eead4' : undefined }}
                    />
                  </span>
                  {label}
                  {isActive && <ChevronRight size={13} className="ml-auto" style={{ opacity: 0.6 }} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Enable push notifications prompt (shown when permission not yet granted) */}
        {typeof Notification !== 'undefined' && Notification.permission === 'default' && (
          <div style={{ padding: '0 12px 10px' }}>
            <button
              onClick={async () => {
                const perm = await Notification.requestPermission()
                if (perm === 'granted') toast.success('Notifications enabled. You\'ll get new order alerts!')
              }}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 10,
                background: 'rgba(45,212,191,.15)', border: '1px solid rgba(45,212,191,.3)',
                color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-body)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Bell size={13} style={{ color: '#5eead4' }} />
              Enable order alerts
            </button>
          </div>
        )}

        {/* Install App — manual fallback, Android Chrome only; iOS has no
            equivalent browser event so this never renders there, but iOS
            admins get the auto InstallPrompt popup with manual guidance */}
        {canInstall && (
          <div style={{ padding: '0 12px 10px' }}>
            <button
              onClick={promptInstall}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 10,
                background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)',
                color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-body)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Download size={13} style={{ color: '#fff' }} />
              Install App
            </button>
          </div>
        )}

        {/* User + Logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '12px 12px 16px' }}>
          {user?.email && (
            <div className="px-3 py-2 mb-1 rounded-xl" style={{ background: 'rgba(255,255,255,.06)' }}>
              <p className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,.7)' }}>
                {user.email}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(45,212,191,.6)', fontSize: 10 }}>
                {userRole === 'sales' ? 'Sales' : 'Administrator'}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all"
            style={{ color: 'rgba(255,255,255,.45)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,.06)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,.45)'; e.currentTarget.style.background = 'transparent' }}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

// ─── PWA manifest + iOS meta tag swap ────────────────────────────────────────
// When an admin opens /admin, swap the manifest to admin-manifest.json so
// Android offers to install "KR Vegetables Admin" (starting at /admin) as a
// separate PWA.
//
// iOS Safari and Chrome-on-iOS do NOT read manifest.json name/icon fields for
// "Add to Home Screen" — both are WebKit under the hood and only look at the
// apple-mobile-web-app-title meta tag and apple-touch-icon link tag in the
// current document. Without swapping those too, an admin installing from
// /admin on an iPhone would still get "KR Vegetables" (the customer app name
// and icon) on their home screen instead of "KR Vegetables Admin" with its
// own dark, badged icon. This hook swaps all signals together and restores
// the customer versions on unmount.
function useAdminManifest() {
  useEffect(() => {
    const manifestLink = document.querySelector('link[rel="manifest"]')
    const titleMeta     = document.querySelector('meta[name="apple-mobile-web-app-title"]')
    const themeMeta      = document.querySelector('meta[name="theme-color"]')
    const touchIcons     = document.querySelectorAll('link[rel="apple-touch-icon"]')

    const prevManifest = manifestLink?.getAttribute('href')
    const prevTitle     = titleMeta?.getAttribute('content')
    const prevTheme      = themeMeta?.getAttribute('content')
    const prevIconHrefs  = Array.from(touchIcons).map((el) => el.getAttribute('href'))

    manifestLink?.setAttribute('href', '/admin-manifest.json')
    titleMeta?.setAttribute('content', 'KR Vegetables Admin')
    themeMeta?.setAttribute('content', '#052e16')
    // Swap each apple-touch-icon to its admin-branded equivalent
    // (/icon-180.png -> /admin-icon-180.png, etc.) so the home screen icon
    // is visually distinct from the customer app, not just differently named.
    touchIcons.forEach((el) => {
      const href = el.getAttribute('href')
      if (href) el.setAttribute('href', href.replace('/icon-', '/admin-icon-'))
    })

    document.title = 'KR Vegetables Admin'

    return () => {
      manifestLink?.setAttribute('href', prevManifest || '/manifest.json')
      titleMeta?.setAttribute('content', prevTitle || 'KR Vegetables')
      themeMeta?.setAttribute('content', prevTheme || '#2D6A4F')
      touchIcons.forEach((el, i) => el.setAttribute('href', prevIconHrefs[i]))
      document.title = 'KR Vegetables & Fruits'
    }
  }, [])
}

/**
 * Clears the app icon badge (set by sw.js on new-order push) whenever the
 * admin actually opens/focuses the dashboard — viewing the orders list is
 * the natural "I've seen this" signal. Not supported on iOS (Apple has not
 * implemented the Badging API) — calls silently no-op there. Also tells the
 * service worker to reset its persisted counter so a later push increments
 * from zero, not from a stale count.
 */
function useClearBadgeOnFocus() {
  useEffect(() => {
    const clear = () => {
      navigator.clearAppBadge?.().catch(() => {})
      navigator.serviceWorker?.controller?.postMessage({ type: 'CLEAR_BADGE' })
    }
    clear() // on mount
    const onVisible = () => { if (document.visibilityState === 'visible') clear() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', clear)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', clear)
    }
  }, [])
}

/**
 * Subscribes the current admin device to Web Push notifications so it
 * receives "New Order" alerts even when the dashboard is closed.
 * Runs once per browser session. Tagged as subscriber_type='admin' so
 * push-send can target admin devices separately from customers.
 */
function useAdminPushSubscription() {
  useEffect(() => {
    const VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY
    if (!VAPID_KEY || !('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (Notification.permission === 'denied') return

    // Only auto-subscribe if permission already granted — don't pester admin on every load.
    // If permission is 'default', a one-time prompt appears via the bell button in the UI.
    if (Notification.permission !== 'granted') return

    const subscribeAdmin = async () => {
      try {
        const reg = await navigator.serviceWorker.ready
        let sub = await reg.pushManager.getSubscription()
        if (!sub) {
          const padding = '='.repeat((4 - (VAPID_KEY.length % 4)) % 4)
          const base64  = (VAPID_KEY + padding).replace(/-/g, '+').replace(/_/g, '/')
          const raw     = atob(base64)
          const key     = new Uint8Array(raw.length)
          for (let i = 0; i < raw.length; i++) key[i] = raw.charCodeAt(i)
          sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })
        }

        const ab2b64 = (buf) => {
          const bytes = new Uint8Array(buf)
          let bin = ''
          for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i])
          return btoa(bin)
        }

        await fetch('/api/push-subscribe', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            endpoint:       sub.endpoint,
            p256dh:         ab2b64(sub.getKey('p256dh')),
            auth:           ab2b64(sub.getKey('auth')),
            subscriberType: 'admin',
          }),
        })
      } catch { /* non-critical — admin can still use the panel without push */ }
    }

    subscribeAdmin()
  }, [])
}

export default function AdminLayout() {
  useAdminManifest()
  useAdminPushSubscription()   // subscribe this device to receive new-order push alerts
  useClearBadgeOnFocus()       // clear the app icon badge once the admin actually looks
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--gray-50)', fontFamily: 'var(--font-body)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile topbar */}
        <header
          className="lg:hidden flex items-center gap-3 px-4 shrink-0"
          style={{
            height: 56,
            background: '#fff',
            borderBottom: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'var(--gray-100)' }}
          >
            <Menu size={18} style={{ color: 'var(--text-dark)' }} />
          </button>
          <img
            src={logoImg}
            alt="KR Vegetables"
            style={{ height: 36, width: 'auto', objectFit: 'contain', cursor: 'pointer' }}
            onClick={() => navigate('/admin')}
          />
          <span className="text-sm font-semibold" style={{ color: 'var(--teal-700)' }}>Admin</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <InstallPrompt
        appName="KR Vegetables Admin"
        benefits={ADMIN_INSTALL_BENEFITS}
        iconSrc="/admin-icon-192.png"
        accent="#5eead4"
        bg="#0a2818"
        textColor="#fff"
        mutedColor="rgba(255,255,255,.65)"
        storageKey="kr-install-dismissed-admin"
      />
    </div>
  )
}
