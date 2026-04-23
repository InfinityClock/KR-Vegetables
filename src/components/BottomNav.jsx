import { NavLink } from 'react-router-dom'
import { Home, ShoppingBag, ShoppingCart, Package, User } from 'lucide-react'
import { useCartCount } from '../store/cartStore'

const tabs = [
  { to: '/',        icon: Home,         label: 'Home',   exact: true },
  { to: '/shop',    icon: ShoppingBag,  label: 'Shop'  },
  { to: '/cart',    icon: ShoppingCart, label: 'Cart'  },
  { to: '/orders',  icon: Package,      label: 'Orders'},
  { to: '/profile', icon: User,         label: 'Profile'},
]

export default function BottomNav() {
  const cartCount = useCartCount()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--border-light)',
        boxShadow: '0 -4px 24px rgba(28,26,23,.06)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-stretch" style={{ height: 'var(--nav-h)' }}>
        {tabs.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <>
                <div
                  className="flex items-center justify-center relative"
                  style={{ width: 44, height: 30 }}
                >
                  {/* Pill indicator behind icon */}
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 15,
                        background: 'var(--brand-50)',
                      }}
                    />
                  )}
                  {label === 'Cart' ? (
                    <span className="relative z-10">
                      <Icon
                        size={19}
                        strokeWidth={isActive ? 2.2 : 1.6}
                        style={{ color: isActive ? 'var(--brand-800)' : 'var(--text-muted)', display: 'block' }}
                      />
                      {cartCount > 0 && (
                        <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
                      )}
                    </span>
                  ) : (
                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.2 : 1.6}
                      className="relative z-10"
                      style={{ color: isActive ? 'var(--brand-800)' : 'var(--text-muted)' }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '9.5px',
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? 'var(--brand-800)' : 'var(--text-light)',
                    lineHeight: 1,
                    letterSpacing: isActive ? '.03em' : '.01em',
                  }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
