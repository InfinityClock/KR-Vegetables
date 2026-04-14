import { Search, ShoppingCart, ArrowLeft, MapPin, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCartCount } from '../store/cartStore'

export function HomeTopBar({ onSearchClick }) {
  const navigate = useNavigate()
  const cartCount = useCartCount()

  return (
    <header
      className="sticky top-0 z-40 lg:hidden"
      style={{
        height: 'var(--topbar-h)',
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: '0 1px 12px rgba(15,23,42,.06)',
      }}
    >
      <div className="flex items-center justify-between h-full px-4 gap-3">

        {/* Logo + Delivery info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Logo mark */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--brand-800), var(--brand-500))',
              boxShadow: '0 2px 8px rgba(22,163,74,.35)',
            }}
          >
            KR
          </div>

          {/* Brand + delivery line */}
          <div className="min-w-0">
            <h1
              className="text-base font-bold leading-none tracking-tight truncate"
              style={{ fontFamily: 'Playfair Display, serif', color: 'var(--brand-800)' }}
            >
              KR Vegetables
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock size={10} style={{ color: 'var(--brand-600)', flexShrink: 0 }} />
              <p className="text-xs font-medium truncate" style={{ color: 'var(--brand-600)' }}>
                Same-day delivery
              </p>
            </div>
          </div>
        </div>

        {/* Search bar (compact) */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 flex-1 max-w-[160px] h-9 rounded-full px-3 text-sm text-left transition-all active:scale-95"
          style={{
            background: 'var(--gray-100)',
            border: '1.5px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <Search size={14} style={{ flexShrink: 0 }} />
          <span className="truncate" style={{ fontSize: '0.8125rem' }}>Search...</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => navigate('/cart')}
          className="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90"
          style={{
            background: 'var(--brand-50)',
            border: '1.5px solid var(--brand-200)',
          }}
          aria-label="Cart"
        >
          <ShoppingCart size={18} style={{ color: 'var(--brand-600)' }} />
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
          )}
        </button>
      </div>
    </header>
  )
}

export function PageTopBar({ title, showBack = true, rightAction }) {
  const navigate = useNavigate()

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-3 px-4 lg:hidden"
      style={{
        height: 'var(--topbar-h)',
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: '0 1px 12px rgba(15,23,42,.06)',
      }}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90"
          style={{
            background: 'var(--gray-100)',
            border: '1px solid var(--border)',
          }}
          aria-label="Go back"
        >
          <ArrowLeft size={18} style={{ color: 'var(--text-dark)' }} />
        </button>
      )}
      <h1
        className="flex-1 text-lg font-bold truncate tracking-tight"
        style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-dark)' }}
      >
        {title}
      </h1>
      {rightAction}
    </header>
  )
}
