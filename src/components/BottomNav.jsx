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
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-light)',
        boxShadow: '0 -4px 24px rgba(15,23,42,.08)',
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
          >
            {({ isActive }) => (
              <>
                {/* Icon container */}
                <div
                  className="relative flex items-center justify-center rounded-2xl transition-all duration-200"
                  style={isActive ? {
                    width: 44,
                    height: 32,
                    background: 'var(--brand-50)',
                  } : {
                    width: 44,
                    height: 32,
                  }}
                >
                  {label === 'Cart' ? (
                    <span className="relative">
                      <Icon
                        size={20}
                        strokeWidth={isActive ? 2.5 : 1.8}
                        style={{ color: isActive ? 'var(--brand-600)' : 'var(--gray-400)' }}
                      />
                      {cartCount > 0 && (
                        <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
                      )}
                    </span>
                  ) : (
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      style={{ color: isActive ? 'var(--brand-600)' : 'var(--gray-400)' }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? 'var(--brand-600)' : 'var(--gray-400)',
                    lineHeight: 1,
                    letterSpacing: isActive ? '.01em' : 0,
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
