import { NavLink } from 'react-router-dom'
import { Home, ShoppingBag, ShoppingCart, Package, User } from 'lucide-react'
import { useCartCount } from '../store/cartStore'

const tabs = [
  { to: '/',        icon: Home,         label: 'Home',   exact: true },
  { to: '/shop',    icon: ShoppingBag,  label: 'Shop'  },
  { to: '/cart',    icon: ShoppingCart, label: 'Cart'  },
  { to: '/orders',  icon: Package,      label: 'Orders'},
  { to: '/profile', icon: User,         label: 'Me'    },
]

export default function BottomNav() {
  const cartCount = useCartCount()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-light)',
        boxShadow: '0 -2px 20px rgba(0,0,0,.07)',
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
            style={({ isActive }) => ({
              color: isActive ? 'var(--green-mid)' : 'var(--text-light)',
            })}
          >
            {({ isActive }) => (
              <>
                {/* Active indicator pill */}
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      width: 28,
                      height: 3,
                      background: 'var(--green-mid)',
                      borderRadius: '0 0 4px 4px',
                    }}
                  />
                )}

                {/* Cart icon with badge */}
                {label === 'Cart' ? (
                  <span className="relative">
                    <span
                      className="flex items-center justify-center rounded-full transition-all"
                      style={isActive ? {
                        width: 40, height: 40,
                        background: 'var(--green-tint)',
                        marginTop: -4,
                      } : {
                        width: 32, height: 32,
                      }}
                    >
                      <Icon
                        size={isActive ? 22 : 21}
                        strokeWidth={isActive ? 2.4 : 1.8}
                      />
                    </span>
                    {cartCount > 0 && (
                      <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
                    )}
                  </span>
                ) : (
                  <span
                    className="flex items-center justify-center rounded-full transition-all"
                    style={isActive ? {
                      width: 40, height: 40,
                      background: 'var(--green-tint)',
                      marginTop: -4,
                    } : {
                      width: 32, height: 32,
                    }}
                  >
                    <Icon
                      size={isActive ? 22 : 21}
                      strokeWidth={isActive ? 2.4 : 1.8}
                    />
                  </span>
                )}

                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? 600 : 400,
                    lineHeight: 1,
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
