import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Package } from 'lucide-react'
import { PageTopBar } from '../../components/TopBar'
import toast from 'react-hot-toast'

export default function Orders() {
  const navigate = useNavigate()
  const [orderNumber, setOrderNumber] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTrack = async (e) => {
    e.preventDefault()
    const num = orderNumber.trim().toUpperCase()
    if (!num) { toast.error('Please enter your order number'); return }

    setLoading(true)
    try {
      // Use the public track-order endpoint — admin-orders requires admin auth
      const res = await fetch(`/api/track-order?orderNumber=${encodeURIComponent(num)}`)
      const data = await res.json()
      if (!res.ok || !data?.id) {
        toast.error('Order not found. Check the number and try again.')
        return
      }
      navigate(`/track/${data.id}`)
    } catch {
      toast.error('Could not look up order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-nav page-enter" style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>
      <PageTopBar title="Track Order" showBack={false} />

      <div className="flex flex-col items-center justify-center px-6 pt-20 pb-10 gap-6">
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 80, height: 80, background: 'var(--green-tint)', border: '2px solid var(--green-pale)' }}
        >
          <Package size={36} strokeWidth={1.5} style={{ color: 'var(--green-mid)' }} />
        </div>

        <div className="text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)', maxWidth: 280, margin: '0 auto' }}>
            Enter your order number from the confirmation page or WhatsApp message
          </p>
        </div>

        <form onSubmit={handleTrack} className="w-full" style={{ maxWidth: 360 }}>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. 1001"
              className="w-full h-13 px-4 rounded-2xl text-sm outline-none"
              style={{
                height: 52,
                border: '1.5px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-dark)',
                fontFamily: 'var(--font-body)',
                letterSpacing: '.04em',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--green-mid)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 btn-ripple"
              style={{
                height: 52,
                background: loading ? 'var(--green-light)' : 'linear-gradient(135deg, var(--green-dark), var(--green-mid))',
                border: 'none',
                fontFamily: 'var(--font-body)',
                cursor: loading ? 'wait' : 'pointer',
              }}
            >
              <Search size={16} />
              {loading ? 'Looking up…' : 'Track Order'}
            </button>
          </div>
        </form>

        <p className="text-xs text-center" style={{ color: 'var(--text-light)', maxWidth: 280 }}>
          Your order number was shown on the confirmation screen. Save it to track your order here.
        </p>
      </div>
    </div>
  )
}
