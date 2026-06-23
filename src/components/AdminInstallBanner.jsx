import { useState, useEffect } from 'react'
import { Share, X, Smartphone } from 'lucide-react'

const DISMISS_KEY = 'kr-admin-install-dismissed'

/**
 * iOS does not support the `beforeinstallprompt` event at all — Safari and
 * Chrome-on-iOS are both WebKit under the hood and Apple has never
 * implemented it. The only install path on iOS is the manual
 * Share -> Add to Home Screen flow, and nothing in the browser UI tells the
 * user this is possible. This banner fills that gap with explicit,
 * branded instructions so the admin install rate on iPhone/iPad is not zero.
 */
function isIos() {
  const ua = window.navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
}

function isStandalone() {
  return (
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

export default function AdminInstallBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isIos() || isStandalone()) return
    if (localStorage.getItem(DISMISS_KEY) === '1') return
    setVisible(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed left-3 right-3 z-50 rounded-2xl overflow-hidden"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        background: 'linear-gradient(135deg, #052e16 0%, #0a4529 60%, #115e59 100%)',
        boxShadow: '0 12px 32px rgba(0,0,0,.35)',
        border: '1px solid rgba(255,255,255,.08)',
      }}
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,.95)' }}
        >
          <Smartphone size={20} style={{ color: '#052e16' }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: '#fff' }}>
            Install KR Vegetables Admin
          </p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,.65)' }}>
            Add this to your home screen for one-tap access and order alerts.
          </p>

          <ol className="mt-3 space-y-1.5">
            <li className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,.85)' }}>
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold"
                style={{ background: 'rgba(45,212,191,.25)', color: '#5eead4', fontSize: 10 }}
              >1</span>
              Tap <Share size={13} style={{ display: 'inline', verticalAlign: '-2px', margin: '0 2px' }} /> Share in the toolbar
            </li>
            <li className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,.85)' }}>
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold"
                style={{ background: 'rgba(45,212,191,.25)', color: '#5eead4', fontSize: 10 }}
              >2</span>
              Scroll down and tap "Add to Home Screen"
            </li>
            <li className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,.85)' }}>
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold"
                style={{ background: 'rgba(45,212,191,.25)', color: '#5eead4', fontSize: 10 }}
              >3</span>
              Tap "Add" in the top right
            </li>
          </ol>
        </div>

        <button
          onClick={dismiss}
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,.1)', border: 'none', cursor: 'pointer' }}
          aria-label="Dismiss"
        >
          <X size={14} style={{ color: 'rgba(255,255,255,.7)' }} />
        </button>
      </div>
    </div>
  )
}
