import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Package, ShoppingBag, Share2 } from 'lucide-react'
import { formatPrice, formatDateTime } from '../../utils/format'
import { WHATSAPP_NUMBER } from '../../constants'

export default function OrderSuccess() {
  const { orderId }  = useParams()
  const navigate     = useNavigate()
  const { state, search } = useLocation()

  // Order may come from navigation state (immediately after checkout)
  // or we show generic success if user landed via Zoho redirect
  const [order, setOrder] = useState(state?.order || null)
  const [loading, setLoading] = useState(!state?.order)

  const params = new URLSearchParams(search)
  const paymentStatus = params.get('payment') // 'success' from Zoho redirect

  // When Zoho redirects back with ?payment=success, fetch the order
  // via service key since RLS may block anonymous reads
  useEffect(() => {
    if (order || !orderId) { setLoading(false); return }

    // Fetch via the admin-orders endpoint which uses service key
    fetch(`/api/admin-orders?orderId=${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        const match = Array.isArray(data) ? data.find((o) => o.id === orderId) : null
        setOrder(match || null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  const handleShare = () => {
    const msg = `🌿 My order ${order?.order_number} is placed at KR Vegetables & Fruits! Delivery slot: ${order?.delivery_slot}. 🚚`
    if (navigator.share) {
      navigator.share({ title: 'Order Placed!', text: msg, url: window.location.origin })
    } else {
      const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
      window.open(url, '_blank')
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 page-enter"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Checkmark */}
      <div
        style={{
          width: 88, height: 88,
          borderRadius: '50%',
          background: 'var(--brand-50)',
          border: '2px solid var(--brand-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <CheckCircle size={48} strokeWidth={1.5} style={{ color: 'var(--brand-700)' }} />
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.2rem',
          fontWeight: 600,
          color: 'var(--text-dark)',
          letterSpacing: '-.03em',
          lineHeight: 1.15,
          textAlign: 'center',
          marginBottom: 6,
        }}
      >
        Order Placed!
      </h1>

      {paymentStatus === 'success' && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--brand-700)', fontWeight: 600, marginBottom: 4 }}>
          ✅ Payment confirmed
        </p>
      )}

      {state?.name && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', marginBottom: 20 }}>
          Thank you, {state.name}!
        </p>
      )}

      {order && !loading && (
        <>
          <div style={{
            background: 'var(--brand-50)',
            border: '1px solid var(--brand-100)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 20px',
            marginBottom: 6,
          }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, color: 'var(--brand-800)', letterSpacing: '.06em' }}>
              {order.order_number}
            </span>
          </div>

          {order.placed_at && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4 }}>
              Placed on {formatDateTime(order.placed_at)}
            </p>
          )}
          {order.delivery_slot && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--brand-700)', fontWeight: 600, marginBottom: 24 }}>
              🕐 Delivery slot: {order.delivery_slot}
            </p>
          )}

          {/* Order details */}
          <div style={{
            width: '100%', maxWidth: 380,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: 24,
          }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
              {order.order_items?.length ?? 0} items ordered
            </p>
            <div className="flex flex-col gap-1.5">
              {order.order_items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-mid)' }}>
                    {item.product_name} × {item.quantity}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: 'var(--border-light)', margin: '10px 0' }} />
            <div className="flex justify-between">
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--brand-800)' }}>
                {formatPrice(order.total_amount)}
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', marginTop: 6 }}>
              {order.payment_method === 'cod' ? '💵 Cash on Delivery' : '✅ Paid Online'}
            </p>
          </div>
        </>
      )}

      {loading && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', marginBottom: 24 }}>
          Loading order details…
        </p>
      )}

      {!order && !loading && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', marginBottom: 24, textAlign: 'center', maxWidth: 300 }}>
          Your order is confirmed! We'll send updates via WhatsApp.
        </p>
      )}

      {/* CTAs */}
      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {orderId && (
          <button
            onClick={() => navigate(`/track/${orderId}`)}
            className="btn-ripple flex items-center justify-center gap-2"
            style={{
              width: '100%', height: 52,
              background: 'var(--brand-800)', color: '#fff',
              borderRadius: 'var(--radius-sm)', border: 'none',
              fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Package size={18} /> Track My Order
          </button>
        )}

        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2"
          style={{
            width: '100%', height: 44,
            border: '1.5px solid var(--brand-800)',
            borderRadius: 'var(--radius-sm)',
            background: 'transparent', color: 'var(--brand-800)',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Share2 size={16} /> Share on WhatsApp
        </button>

        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2"
          style={{
            width: '100%', height: 44,
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card)', color: 'var(--text-mid)',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <ShoppingBag size={16} /> Continue Shopping
        </button>
      </div>
    </div>
  )
}
