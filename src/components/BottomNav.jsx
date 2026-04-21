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
        background: 'rgba(245,242,236,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-stretch" style={{ height: 'var(--nav-h)' }}>
        {tabs.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className="flex-1 flex flex-col items-center justify-center gap-1 relative"
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <>
                <div
                  className="flex items-center justify-center transition-all duration-200"
                  style={{ width: 36, height: 28, position: 'relative' }}
                >
                  {label === 'Cart' ? (
                    <span className="relative">
                      <Icon
                        size={19}
                        strokeWidth={isActive ? 2.2 : 1.6}
                        style={{ color: isActive ? 'var(--brand-800)' : 'var(--text-muted)' }}
                      />
                      {cartCount > 0 && (
                        <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
                      )}
                    </span>
                  ) : (
                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.2 : 1.6}
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
                {/* Active indicator dot */}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: 'var(--brand-800)',
                    }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
