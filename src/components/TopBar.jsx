import { Search, ShoppingCart, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCartCount } from '../store/cartStore'

export function HomeTopBar({ onSearchClick }) {
  const navigate = useNavigate()
  const cartCount = useCartCount()

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 lg:hidden"
      style={{
        height: 'var(--topbar-h)',
        background: 'rgba(255,253,247,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: '0 1px 8px rgba(0,0,0,.04)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-base font-black"
          style={{ background: 'linear-gradient(135deg, var(--green-dark), var(--green-light))' }}
        >
          KR
        </div>
        <div>
          <p className="text-xs font-medium leading-none" style={{ color: 'var(--text-muted)' }}>Fresh from the farm</p>
          <h1
            className="text-base font-bold leading-tight"
            style={{ fontFamily: 'Playfair Display, serif', color: 'var(--green-dark)' }}
          >
            KR Vegetables
          </h1>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSearchClick}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
          aria-label="Search"
        >
          <Search size={17} style={{ color: 'var(--text-mid)' }} />
        </button>
        <button
          onClick={() => navigate('/cart')}
          className="relative w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{ background: 'var(--green-tint)', border: '1px solid var(--green-pale)' }}
          aria-label="Cart"
        >
          <ShoppingCart size={17} style={{ color: 'var(--green-mid)' }} />
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
        background: 'rgba(255,253,247,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: '0 1px 8px rgba(0,0,0,.04)',
      }}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90"
          style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
          aria-label="Go back"
        >
          <ArrowLeft size={18} style={{ color: 'var(--text-dark)' }} />
        </button>
      )}
      <h1
        className="flex-1 text-lg font-bold truncate"
        style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-dark)' }}
      >
        {title}
      </h1>
      {rightAction}
    </header>
  )
}
