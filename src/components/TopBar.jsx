import { Search, ShoppingCart, ArrowLeft, Clock } from 'lucide-react'
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
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: '0 1px 12px rgba(15,23,42,.06)',
      }}
    >
      <div className="flex items-center justify-between h-full px-4 gap-3">

        {/* Logo + Delivery info */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          {/* Actual logo */}
          <img
            src={logoImg}
            alt="KR Vegetables & Fruits"
            style={{ height: 42, width: 'auto', objectFit: 'contain', flexShrink: 0 }}
            onClick={() => navigate('/')}
            className="cursor-pointer"
          />
          {/* Delivery badge */}
          <span
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full shrink-0"
            style={{
              background: 'var(--teal-50)',
              border: '1px solid var(--teal-100)',
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--teal-700)',
              letterSpacing: '.2px',
            }}
          >
            <Clock size={9} />
            Same-day delivery
          </span>
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
          <span className="truncate" style={{ fontSize: '0.8125rem' }}>Search…</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => navigate('/cart')}
          className="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90"
          style={{
            background: 'var(--teal-50)',
            border: '1.5px solid var(--teal-200)',
          }}
          aria-label="Cart"
        >
          <ShoppingCart size={18} style={{ color: 'var(--teal-600)' }} />
          {cartCount > 0 && (
            <span
              className="absolute"
              style={{
                top: -4, right: -4,
                background: 'var(--teal-600)',
                color: '#fff',
                fontSize: 9,
                fontWeight: 700,
                minWidth: 18,
                height: 18,
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                border: '2px solid #fff',
                lineHeight: 1,
              }}
            >
              {cartCount > 99 ? '99+' : cartCount}
            </span>
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
        background: 'rgba(255,255,255,0.97)',
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
