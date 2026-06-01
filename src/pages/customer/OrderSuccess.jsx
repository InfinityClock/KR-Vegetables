import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  CheckCircle, Package, ShoppingBag, Share2, Copy, Check,
  Bell, XCircle, Clock, RefreshCw, Banknote, AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPrice, formatDateTime } from '../../utils/format'
import { WHATSAPP_NUMBER } from '../../constants'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import { useRecentOrdersStore } from '../../store/recentOrdersStore'
import { useCartStore } from '../../store/cartStore'

// ─── Notification prompt ──────────────────────────────────────────────────────
function NotificationPrompt({ orderId }) {
  const { isSupported, permission, isSubscribed, loading, subscribe } = usePushNotifications()
  const [dismissed, setDismissed] = useState(false)
  const [done, setDone]           = useState(false)

  if (!isSupported || permission === 'denied' || isSubscribed || dismissed) return null
  if (done) {
    return (
      <div style={{
        width: '100%', maxWidth: 380,
        background: '#f0fdf4', border: '1.5px solid #bbf7d0',
        borderRadius: 14, padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
      }}>
        <CheckCircle size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: '#166534', margin: 0 }}>
          You'll be notified when your order ships!
        </p>
      </div>
    )
  }
  return (
    <div style={{
      width: '100%', maxWidth: 380,
      background: 'var(--bg-card)', border: '1.5px solid var(--brand-100)',
      borderRadius: 14, padding: '16px', marginBottom: 12, position: 'relative',
    }}>
      <button
        onClick={() => setDismissed(true)}
        style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: 18, lineHeight: 1 }}
      >×</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bell size={16} style={{ color: 'var(--brand-600)' }} />
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>Get delivery updates</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Know when your order is out for delivery</p>
        </div>
      </div>
      <button
        disabled={loading}
        onClick={async () => {
          const result = await subscribe(orderId)
          if (result.ok) setDone(true)
          else if (result.reason === 'denied') setDismissed(true)
        }}
        style={{
          width: '100%', height: 40,
          background: loading ? 'var(--border)' : 'var(--brand-800)',
          color: loading ? 'var(--text-muted)' : '#fff',
          border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <Bell size={14} /> {loading ? 'Enabling…' : 'Enable Notifications'}
      </button>
    </div>
  )
}

// ─── Payment failed state ─────────────────────────────────────────────────────
function PaymentFailed({ orderId, orderNumber, onRetry, retrying, switchingCod, onSwitchCod }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>

      <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#fef2f2', border: '2px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <XCircle size={48} strokeWidth={1.5} style={{ color: '#dc2626' }} />
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', letterSpacing: '-.03em', marginBottom: 8, textAlign: 'center' }}>
        Payment Failed
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 320, marginBottom: 8, lineHeight: 1.6 }}>
        Your payment could not be processed. This can happen if the 15-minute payment session expired or the transaction was declined. Please try again.
      </p>
      {orderNumber && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-full)', padding: '5px 16px', marginBottom: 28 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: '#991b1b' }}>{orderNumber}</span>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Retry online payment */}
        <button
          onClick={onRetry}
          disabled={retrying}
          style={{
            width: '100%', height: 52,
            background: retrying ? 'var(--border)' : 'var(--brand-800)', color: retrying ? 'var(--text-muted)' : '#fff',
            border: 'none', borderRadius: 'var(--radius-sm)', cursor: retrying ? 'wait' : 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <RefreshCw size={16} style={{ animation: retrying ? 'spin 1s linear infinite' : 'none' }} />
          {retrying ? 'Creating payment link…' : 'Try Payment Again'}
        </button>

        {/* Switch to COD */}
        <button
          onClick={onSwitchCod}
          disabled={switchingCod}
          style={{
            width: '100%', height: 48,
            background: 'var(--bg-card)', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-sm)', cursor: switchingCod ? 'wait' : 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Banknote size={16} style={{ color: 'var(--text-muted)' }} />
          {switchingCod ? 'Switching…' : 'Pay with Cash on Delivery instead'}
        </button>

        <a
          href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I had a payment issue with order ${orderNumber || orderId}. Can you help?`)}`}
          target="_blank" rel="noreferrer"
          style={{
            width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'transparent', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: '#16a34a',
            textDecoration: 'none',
          }}
        >
          💬 Get help on WhatsApp
        </a>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Payment pending state (bank transfer) ────────────────────────────────────
function PaymentPending({ order, orderNumber }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
      <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#fffbeb', border: '2px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Clock size={48} strokeWidth={1.5} style={{ color: '#d97706' }} />
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', letterSpacing: '-.03em', marginBottom: 8, textAlign: 'center' }}>
        Payment Processing
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 320, marginBottom: 24 }}>
        Your bank transfer is being processed. We'll confirm your order as soon as the payment clears.
      </p>
      {orderNumber && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-full)', padding: '5px 16px', marginBottom: 28 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: '#92400e' }}>{orderNumber}</span>
        </div>
      )}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 16px', maxWidth: 380, marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#92400e', margin: 0, lineHeight: 1.5 }}>
          <strong>Note:</strong> Bank transfers can take up to 24 hours. You'll receive a notification once the payment is confirmed.
        </p>
      </div>
    </div>
  )
}

// ─── Main OrderSuccess page ───────────────────────────────────────────────────
export default function OrderSuccess() {
  const { orderId }            = useParams()
  const navigate               = useNavigate()
  const { state, search }      = useLocation()
  const addOrderedItems        = useRecentOrdersStore((s) => s.addOrderedItems)
  const clearCart              = useCartStore((s) => s.clearCart)

  const [order,   setOrder]   = useState(state?.order || null)
  // For online payment redirects, loading=false immediately (we build from sessionStorage)
  const [loading, setLoading] = useState(!state?.order && !new URLSearchParams(search).get('payment'))
  const [copied,  setCopied]  = useState(false)

  // Zoho redirect params — per Zoho docs (payment session hosted page redirect):
  //   payment_session_id  — singular, the session identifier
  //   payment_id          — the payment identifier
  //   signature           — HMAC-SHA256 of "payment_id|payment_session_id"
  // Our custom param:
  //   ct                  — HMAC confirm token embedded by zoho-payment.js
  //   payment             — 'success' | 'failed' (our own routing param)
  const params            = new URLSearchParams(search)
  const paymentParam      = params.get('payment')             // 'success' | 'failed' | null (cod)
  const confirmToken      = params.get('ct')             || '' // HMAC token embedded by zoho-payment.js
  const paymentSessionId  = params.get('payment_session_id')  || '' // Zoho: singular (docs-correct name)
  const paymentsSessionId = paymentSessionId || params.get('payments_session_id') || '' // tolerate both spellings
  const paymentId         = params.get('payment_id')     || ''

  // Derive actual state — for hosted payment sessions Zoho does not send a
  // payment_session_status param; success/failure is determined by which URL Zoho
  // redirected to (success_url vs failure_url), which we encode as ?payment=success|failed.
  const isOnlinePayment = !!paymentParam
  const isCod           = !isOnlinePayment
  const isFailed        = paymentParam === 'failed'
  const isPending       = false  // bank transfers use payment links, not sessions
  const isSuccess       = isCod || paymentParam === 'success'

  // Retry state
  const [retrying,     setRetrying]     = useState(false)
  const [switchingCod, setSwitchingCod] = useState(false)

  // Pending order info (for retry)
  const [pendingOrder, setPendingOrder] = useState(null)

  // ── On success: commit cart + confirm payment in DB ──────────────────────
  useEffect(() => {
    if (!isSuccess) return

    // 1. Read sessionStorage and build display order from it
    try {
      const raw = sessionStorage.getItem('kr-pending-order')
      if (raw) {
        const pending = JSON.parse(raw)
        setPendingOrder(pending)
        if (pending.items?.length) addOrderedItems(pending.items)
        clearCart()
        sessionStorage.removeItem('kr-pending-order')

        // Use stored data to render order details right away
        // (avoids the admin-orders auth requirement for customer-facing pages)
        if (!state?.order) {
          setOrder({
            id:             pending.orderId,
            order_number:   pending.orderNumber,
            total_amount:   pending.amount,
            delivery_slot:  pending.deliverySlot,
            payment_method: isOnlinePayment ? 'zoho' : 'cod',
            order_items:    (pending.items || []).map((i) => ({
              product_name: i.name,
              quantity:     i.quantity ?? 1,
              unit:         i.unit,
            })),
          })
        }
      }
    } catch {}

    // 2. If this is an online payment redirect, confirm it server-side
    //    (primary path — don't rely solely on the webhook)
    if (isOnlinePayment && orderId) {
      fetch('/api/confirm-payment', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentsSessionId: paymentsSessionId || undefined,
          confirmToken:      confirmToken || undefined,
        }),
      }).catch(() => { /* non-critical — webhook is secondary fallback */ })
    }
  }, [isSuccess])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load pending order info for retry (on failure) ────────────────────────
  useEffect(() => {
    if (!isFailed) return
    try {
      // Clear the active-payment flag so Cart no longer auto-redirects here.
      // kr-pending-order is kept so the "Retry" / "Switch to COD" buttons work.
      sessionStorage.removeItem('kr-payment-active')
      const raw = sessionStorage.getItem('kr-pending-order')
      if (raw) setPendingOrder(JSON.parse(raw))
    } catch {}
  }, [isFailed])

  // ── Load order details from API (COD / admin navigation only) ────────────
  // For online payment redirects we already build the order from sessionStorage above.
  // For COD, the order is passed via React navigation state.
  // This fetch is a fallback for admin deep-links where state/sessionStorage are absent.
  useEffect(() => {
    if (order || !orderId || isFailed || isOnlinePayment) { setLoading(false); return }
    fetch(`/api/admin-orders?orderId=${orderId}`)
      .then(async (r) => {
        if (!r.ok) return null          // 401 / 404 — don't crash
        const d = await r.json()
        return d?.id ? d : null         // only use if it's a real order object
      })
      .then((d) => { if (d) setOrder(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId, isFailed, isOnlinePayment])

  // ── Retry online payment ──────────────────────────────────────────────────
  const handleRetry = useCallback(async () => {
    if (!pendingOrder) return
    setRetrying(true)
    try {
      const res = await fetch('/api/zoho-payment', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId:       pendingOrder.orderId       || orderId,
          orderNumber:   pendingOrder.orderNumber   || '',
          amount:        pendingOrder.amount        || 0,
          customerName:  pendingOrder.customerName  || '',
          customerPhone: pendingOrder.customerPhone || '',
        }),
      })
      const data = await res.json()
      if (data.paymentUrl) {
        window.location.replace(data.paymentUrl)
      } else {
        toast.error('Could not create payment link. Please try Cash on Delivery.')
        setRetrying(false)
      }
    } catch {
      toast.error('Network error. Please try again.')
      setRetrying(false)
    }
  }, [pendingOrder, orderId])

  // ── Switch to Cash on Delivery ────────────────────────────────────────────
  const handleSwitchCod = useCallback(async () => {
    setSwitchingCod(true)
    try {
      await fetch('/api/switch-to-cod', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      // Build order details from pendingOrder so the success page can render them
      let builtOrder = order
      let pendingData = null
      try {
        const raw = sessionStorage.getItem('kr-pending-order')
        if (raw) {
          pendingData = JSON.parse(raw)
          if (!builtOrder && pendingData) {
            builtOrder = {
              id:             pendingData.orderId,
              order_number:   pendingData.orderNumber,
              total_amount:   pendingData.amount,
              delivery_slot:  pendingData.deliverySlot,
              payment_method: 'cod',
              order_items: (pendingData.items || []).map((i) => ({
                product_name: i.name,
                quantity:     i.quantity ?? 1,
                unit:         i.unit,
              })),
            }
          }
          if (pendingData?.items?.length) addOrderedItems(pendingData.items)
          clearCart()
          sessionStorage.removeItem('kr-pending-order')
        }
      } catch {}
      // Navigate to success page as COD with the built order object
      navigate(`/order-success/${orderId}`, { replace: true, state: { order: builtOrder, name: pendingData?.customerName || pendingOrder?.customerName } })
    } catch {
      toast.error('Could not switch to COD. Please contact us on WhatsApp.')
      setSwitchingCod(false)
    }
  }, [orderId, pendingOrder, order])

  // ── Share handler ─────────────────────────────────────────────────────────
  const handleShare = () => {
    const msg = `🌿 My order ${order?.order_number} is placed at KR Vegetables & Fruits! Delivery window: ${order?.delivery_slot}. 🚚`
    if (navigator.share) {
      navigator.share({ title: 'Order Placed!', text: msg, url: window.location.origin })
    } else {
      window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
    }
  }

  // ── Render: payment failed ────────────────────────────────────────────────
  if (isFailed) {
    return (
      <PaymentFailed
        orderId={orderId}
        orderNumber={pendingOrder?.orderNumber || order?.order_number}
        onRetry={handleRetry}
        retrying={retrying}
        switchingCod={switchingCod}
        onSwitchCod={handleSwitchCod}
      />
    )
  }

  // ── Render: bank transfer pending ─────────────────────────────────────────
  if (isPending) {
    return <PaymentPending order={order} orderNumber={order?.order_number || pendingOrder?.orderNumber} />
  }

  // ── Render: success (COD or confirmed online payment) ─────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 page-enter"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Checkmark */}
      <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--brand-50)', border: '2px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <CheckCircle size={48} strokeWidth={1.5} style={{ color: 'var(--brand-700)' }} />
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 600, color: 'var(--text-dark)', letterSpacing: '-.03em', lineHeight: 1.15, textAlign: 'center', marginBottom: 6 }}>
        Order Placed!
      </h1>

      {paymentParam === 'success' && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--brand-700)', fontWeight: 600, marginBottom: 4 }}>
          ✅ Payment confirmed
        </p>
      )}

      {(state?.name || pendingOrder?.customerName) && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', marginBottom: 20 }}>
          Thank you, {state?.name || pendingOrder?.customerName}!
        </p>
      )}

      {order && !loading && (
        <>
          <button
            onClick={() => navigator.clipboard.writeText(order.order_number).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 'var(--radius-full)', padding: '6px 20px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, color: 'var(--brand-800)', letterSpacing: '.06em' }}>{order.order_number}</span>
              {copied ? <Check size={12} style={{ color: 'var(--brand-700)' }} /> : <Copy size={12} style={{ color: 'var(--brand-800)' }} />}
            </div>
          </button>
          <p style={{ fontSize: '10px', color: 'var(--text-light)', marginBottom: 20, marginTop: -2 }}>
            {copied ? 'Copied!' : 'Tap to copy order number'}
          </p>

          {order.placed_at && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4 }}>
              Placed on {formatDateTime(order.placed_at)}
            </p>
          )}
          {order.delivery_slot && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--brand-700)', fontWeight: 600, marginBottom: 24 }}>
              🕐 Delivery window: {order.delivery_slot}
            </p>
          )}

          <div style={{ width: '100%', maxWidth: 380, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: 24 }}>
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
          Your order is confirmed! Message us on WhatsApp if you have any questions.
        </p>
      )}

      {/* Notification prompt */}
      {!loading && <NotificationPrompt orderId={orderId} />}

      {/* CTAs */}
      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {orderId && (
          <button
            onClick={() => navigate(`/track/${orderId}`)}
            className="btn-ripple flex items-center justify-center gap-2"
            style={{ width: '100%', height: 52, background: 'var(--brand-800)', color: '#fff', borderRadius: 'var(--radius-sm)', border: 'none', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
          >
            <Package size={18} /> Track My Order
          </button>
        )}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2"
          style={{ width: '100%', height: 44, border: '1.5px solid var(--brand-800)', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--brand-800)', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          <Share2 size={16} /> Share on WhatsApp
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2"
          style={{ width: '100%', height: 44, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', color: 'var(--text-mid)', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
        >
          <ShoppingBag size={16} /> Continue Shopping
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
