import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ─── Pending payment redirect (runs BEFORE React) ─────────────────────────────
// Handles the case where a user presses Back from Zoho's payment page and lands
// back on our app without completing payment.
//
// IMPORTANT: We only redirect in two specific cases to avoid blocking new orders:
//   1. bfcache thaw (e.persisted=true) — the Back button restored a frozen page
//   2. Referrer is Zoho's domain — user navigated back from Zoho
//
// We do NOT redirect on regular page loads / navigation within the app, because
// a stale kr-pending-order in sessionStorage would otherwise block every visit.
function checkPendingPayment({ fromBfcache = false } = {}) {
  try {
    const raw = sessionStorage.getItem('kr-pending-order')
    if (!raw) return
    const { orderId } = JSON.parse(raw)
    if (!orderId) return
    const path = window.location.pathname
    if (path.startsWith('/order-success') || path.startsWith('/admin')) return

    const fromZoho = document.referrer.includes('zoho')
    // Only redirect when we know the user just came from Zoho
    if (!fromZoho && !fromBfcache) return

    window.location.replace(`/order-success/${orderId}?payment=failed`)
  } catch {}
}

// Check on initial page load (handles forward navigation from Zoho)
checkPendingPayment({ fromBfcache: false })

window.addEventListener('pageshow', (e) => {
  // Handles Back button bfcache restore
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
