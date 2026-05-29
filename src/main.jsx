import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ─── Pending payment redirect (runs BEFORE React) ─────────────────────────────
// When a Zoho payment is in progress (kr-pending-order in sessionStorage) and
// the user navigates away from Zoho without completing payment, they land on
// /cart (or another non-success page).  We catch that here and immediately
// redirect to the payment-failed screen.
//
// Rules to avoid false positives:
//   • Never redirect if we're already on /order-success or /admin
//   • On /cart specifically: ALWAYS redirect if kr-pending-order exists —
//     the only way to land on /cart with a pending order is pressing Back
//     from the payment page (or bfcache restore of that state).
//   • On OTHER pages: only redirect if coming from Zoho (referrer check) or
//     if the page was restored from bfcache (persisted=true).
function checkPendingPayment({ fromBfcache = false } = {}) {
  try {
    const raw = sessionStorage.getItem('kr-pending-order')
    if (!raw) return
    const { orderId } = JSON.parse(raw)
    if (!orderId) return

    const path = window.location.pathname
    if (path.startsWith('/order-success') || path.startsWith('/admin')) return

    // /cart is the canonical back-nav destination after Zoho redirect.
    // Only redirect when kr-payment-active is set (cleared once the failed
    // screen is shown), so a stale kr-pending-order never blocks the cart.
    if (path === '/cart' || path === '/cart/') {
      if (sessionStorage.getItem('kr-payment-active')) {
        window.location.replace(`/order-success/${orderId}?payment=failed`)
      }
      return
    }

    const fromZoho = document.referrer.includes('zoho')
    if (!fromZoho && !fromBfcache) return

    window.location.replace(`/order-success/${orderId}?payment=failed`)
  } catch {}
}

// Check on initial page load (handles forward navigation from Zoho)
checkPendingPayment({ fromBfcache: false })

window.addEventListener('pageshow', (e) => {
  // Handles Back button bfcache restore on any page
  if (e.persisted) checkPendingPayment({ fromBfcache: true })
})

// ─── Service Worker registration ──────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((err) => console.warn('[SW] Registration failed:', err))
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
