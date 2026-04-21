import { Search, ShoppingCart, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCartCount } from '../store/cartStore'
import logoImg from '../assets/logo.png'

export function HomeTopBar({ onSearchClick }) {
  const navigate = useNavigate()
  const cartCount = useCartCount()

  return (
    <header
      className="sticky top-0 z-40 lg:hidden"
      style={{
        height: 'var(--topbar-h)',
        background: 'rgba(245,242,236,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center gap-3 h-full px-4">
        {/* Logo */}
        <img
          src={logoImg}
          alt="KR Vegetables & Fruits"
          onClick={() => navigate('/')}
          style={{ height: 40, width: 'auto', objectFit: 'contain', flexShrink: 0, cursor: 'pointer' }}
        />

        {/* Search — takes remaining space */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 flex-1 h-9 px-3 text-sm text-left transition-all active:scale-98"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-light)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <Search size={13} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.8125rem' }}>Search vegetables, fruits…</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => navigate('/cart')}
          className="relative flex items-center justify-center shrink-0 transition-all active:scale-90"
          style={{ width: 38, height: 38, borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', background: 'var(--bg-card)' }}
          aria-label="Cart"
        >
          <ShoppingCart size={17} style={{ color: 'var(--text-dark)' }} />
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
        background: 'rgba(245,242,236,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center shrink-0 transition-all active:scale-90"
          style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', background: 'var(--bg-card)' }}
          aria-label="Go back"
        >
          <ArrowLeft size={16} style={{ color: 'var(--text-dark)' }} />
        </button>
      )}
      <h1
        className="flex-1 truncate"
        style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text-dark)' }}
      >
        {title}
      </h1>
      {rightAction}
    </header>
  )
}
