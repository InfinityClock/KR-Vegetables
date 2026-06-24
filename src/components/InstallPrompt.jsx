import { useState, useEffect, useRef } from 'react'
import { Share, X, Download, Check } from 'lucide-react'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

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

function wasDismissedRecently(storageKey) {
  const raw = localStorage.getItem(storageKey)
  if (!raw) return false
  const dismissedAt = Number(raw)
  if (Number.isNaN(dismissedAt)) return false
  return Date.now() - dismissedAt < SEVEN_DAYS_MS
}

/**
 * Premium install prompt, reused for both the customer site and the admin
 * dashboard with different branding via props.
 *
 * Platform behaviour:
 *   Android / desktop Chrome — only renders once `beforeinstallprompt` has
 *     actually fired (i.e. the browser confirms install criteria are met).
 *     "Install Now" calls the native prompt directly.
 *   iOS (Safari + Chrome-on-iOS, both WebKit) — `beforeinstallprompt` does
 *     not exist on this platform at all, by Apple's design. There is no
 *     feature to detect, so the prompt always renders (once, subject to the
 *     7-day dismissal rule) and "Install Now" opens a second guided modal
 *     with the manual Share -> Add to Home Screen -> Add steps, since no
 *     browser-native dialog is possible.
 *   Already installed — detected via `navigator.standalone` (iOS) or
 *     `matchMedia('(display-mode: standalone)')` (cross-platform) and the
 *     prompt never renders at all.
 */
export default function InstallPrompt({
  appName,
  benefits,
  iconSrc,
  accent,        // primary button / accent colour
  bg,            // popup background
  textColor,     // popup primary text colour
  mutedColor,    // popup secondary text colour
  storageKey,
}) {
  const [stage, setStage] = useState('hidden') // 'hidden' | 'benefits' | 'ios-guide'
  const deferredPromptRef = useRef(null)

  useEffect(() => {
    if (isStandalone()) return
    if (wasDismissedRecently(storageKey)) return

    if (isIos()) {
      const t = setTimeout(() => setStage('benefits'), 1500)
      return () => clearTimeout(t)
    }

    // Android / desktop Chrome — wait for the browser to confirm install
    // eligibility before showing anything. Never show a popup whose
    // "Install Now" button would have nothing to do.
    const handler = (e) => {
      e.preventDefault()
      deferredPromptRef.current = e
      setTimeout(() => setStage('benefits'), 1000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [storageKey])

  const dismiss = () => {
    localStorage.setItem(storageKey, String(Date.now()))
    setStage('hidden')
  }

  const handleInstallNow = async () => {
    if (isIos()) {
      setStage('ios-guide')
      return
    }
    const prompt = deferredPromptRef.current
    if (!prompt) { dismiss(); return }
    prompt.prompt()
    await prompt.userChoice
    deferredPromptRef.current = null
    localStorage.setItem(storageKey, String(Date.now()))
    setStage('hidden')
  }

  if (stage === 'hidden') return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(4px)' }}
    >
      {stage === 'benefits' && (
        <div
          className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden"
          style={{ background: bg, boxShadow: '0 24px 64px rgba(0,0,0,.35)' }}
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <img
                src={iconSrc}
                alt={appName}
                className="rounded-2xl"
                style={{ width: 56, height: 56, objectFit: 'cover', boxShadow: '0 4px 16px rgba(0,0,0,.2)' }}
              />
              <button
                onClick={dismiss}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(127,127,127,.15)', border: 'none', cursor: 'pointer' }}
                aria-label="Dismiss"
              >
                <X size={15} style={{ color: mutedColor }} />
              </button>
            </div>

            <h2 className="text-lg font-bold mb-1" style={{ color: textColor, fontFamily: 'var(--font-display)' }}>
              Install {appName}
            </h2>
            <p className="text-sm mb-4" style={{ color: mutedColor }}>
              Add it to your home screen for the best experience.
            </p>

            <ul className="space-y-2 mb-6">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-sm" style={{ color: textColor }}>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: accent + '22' }}
                  >
                    <Check size={12} style={{ color: accent }} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleInstallNow}
                className="h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                style={{ background: accent, color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                <Download size={15} />
                Install Now
              </button>
              <button
                onClick={dismiss}
                className="h-11 rounded-xl text-sm font-semibold"
                style={{ background: 'transparent', color: mutedColor, border: 'none', cursor: 'pointer' }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {stage === 'ios-guide' && (
        <div
          className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden"
          style={{ background: bg, boxShadow: '0 24px 64px rgba(0,0,0,.35)' }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={iconSrc}
                  alt={appName}
                  className="rounded-xl"
                  style={{ width: 40, height: 40, objectFit: 'cover' }}
                />
                <h2 className="text-base font-bold" style={{ color: textColor, fontFamily: 'var(--font-display)' }}>
                  Install {appName}
                </h2>
              </div>
              <button
                onClick={dismiss}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(127,127,127,.15)', border: 'none', cursor: 'pointer' }}
                aria-label="Dismiss"
              >
                <X size={15} style={{ color: mutedColor }} />
              </button>
            </div>

            <ol className="space-y-3 mb-2">
              <li className="flex items-center gap-3 text-sm" style={{ color: textColor }}>
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs"
                  style={{ background: accent + '22', color: accent }}
                >1</span>
                Tap <Share size={15} style={{ display: 'inline', verticalAlign: '-3px', margin: '0 3px', color: accent }} /> Share in the toolbar
              </li>
              <li className="flex items-center gap-3 text-sm" style={{ color: textColor }}>
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs"
                  style={{ background: accent + '22', color: accent }}
                >2</span>
                Scroll down and tap "Add to Home Screen"
              </li>
              <li className="flex items-center gap-3 text-sm" style={{ color: textColor }}>
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs"
                  style={{ background: accent + '22', color: accent }}
                >3</span>
                Tap "Add" in the top right
              </li>
            </ol>

            <button
              onClick={dismiss}
              className="w-full h-11 rounded-xl text-sm font-semibold mt-4"
              style={{ background: accent + '15', color: accent, border: 'none', cursor: 'pointer' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
