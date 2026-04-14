import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Tags, Tag,
  Truck, Settings, Menu, X, LogOut, Leaf, ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/orders',     icon: Package,         label: 'Orders'   },
  { to: '/admin/products',   icon: ShoppingBag,     label: 'Products' },
  { to: '/admin/categories', icon: Tags,            label: 'Categories'},
  { to: '/admin/offers',     icon: Tag,             label: 'Offers'   },
  { to: '/admin/delivery',   icon: Truck,           label: 'Delivery' },
  { to: '/admin/settings',   icon: Settings,        label: 'Settings' },
]

function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()

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
          background: 'linear-gradient(180deg, var(--brand-900) 0%, var(--brand-800) 100%)',
          borderRight: '1px solid rgba(255,255,255,.06)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 cursor-pointer"
          style={{ paddingTop: 24, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,.08)' }}
          onClick={() => { navigate('/admin'); onClose?.() }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-white text-sm"
            style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)' }}
          >
            KR
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-white font-bold text-sm leading-tight tracking-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              KR Vegetables
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.45)' }}>Admin Panel</p>
          </div>
          <button onClick={onClose} className="lg:hidden ml-auto" style={{ color: 'rgba(255,255,255,.5)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                 ${isActive
                   ? 'text-white'
                   : 'hover:text-white'
                 }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'rgba(255,255,255,.15)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,.55)',
              })}
            >
              {({ isActive }) => (
                <>
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: isActive ? 'rgba(255,255,255,.15)' : 'transparent' }}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                  </span>
                  {label}
                  {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '12px 12px 16px' }}>
          {user?.email && (
            <div className="px-3 py-2 mb-1 rounded-xl" style={{ background: 'rgba(255,255,255,.05)' }}>
              <p className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,.7)' }}>
                {user.email}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.35)', fontSize: 10 }}>
                Administrator
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all"
            style={{ color: 'rgba(255,255,255,.5)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.5)'}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--gray-50)', fontFamily: 'Inter, sans-serif' }}>
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
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs"
              style={{ background: 'var(--brand-800)' }}
            >
              KR
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--text-dark)' }}>Admin</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
