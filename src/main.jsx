import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ─── Pending payment redirect (runs BEFORE React) ─────────────────────────────
// When a user presses the browser Back button from Zoho's hosted payment page,
// the browser navigates back to whatever page was in history (usually /cart).
// React's useEffect / component lifecycle does NOT re-run on bfcache restores,
// so we must check here — in plain JS, outside React — to catch both cases:
//   • Full reload  : this code runs synchronously on every page load
//   • bfcache thaw : pageshow fires with e.persisted=true
function checkPendingPayment() {
  try {
    const raw = sessionStorage.getItem('kr-pending-order')
    if (!raw) return
    const { orderId } = JSON.parse(raw)
    if (!orderId) return
    const path = window.location.pathname
    if (path.startsWith('/order-success') || path.startsWith('/admin')) return
    // User is on some other page with a pending payment → treat as abandoned
    window.location.replace(`/order-success/${orderId}?payment=failed`)
  } catch {}
}

checkPendingPayment() // Runs on every full page load

window.addEventListener('pageshow', (e) => {
  // Runs when browser thaws page from bfcache (Back/Forward navigation)
  if (e.persisted) checkPendingPayment()
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
