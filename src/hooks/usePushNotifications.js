import { useState, useEffect, useCallback } from 'react'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

/** Convert VAPID base64url public key to Uint8Array for PushManager */
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = atob(base64)
  const out     = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

/** Convert ArrayBuffer to base64 string */
function ab2b64(buffer) {
  const bytes = new Uint8Array(buffer)
  let bin = ''
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

/**
 * Hook for Web Push subscription management.
 *
 * Usage:
 *   const { isSupported, permission, isSubscribed, loading, subscribe } = usePushNotifications()
 *
 *   subscribe(orderId?)  → requests permission + subscribes + saves to backend
 */
export function usePushNotifications() {
  const isSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    !!VAPID_PUBLIC_KEY

  const [permission, setPermission]   = useState(() =>
    isSupported ? Notification.permission : 'default'
  )
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading]           = useState(false)

  // Check existing subscription on mount
  useEffect(() => {
    if (!isSupported) return
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setIsSubscribed(!!sub))
      .catch(() => {})
  }, [isSupported])

  /**
   * Request notification permission, subscribe to push, and save to backend.
   * @param {string|null} orderId  Optional order UUID to associate with subscription
   * @returns {{ ok: boolean, reason?: string }}
   */
  const subscribe = useCallback(async (orderId = null) => {
    if (!isSupported) return { ok: false, reason: 'not_supported' }
    setLoading(true)
    try {
      // Ask the user for permission
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') return { ok: false, reason: 'denied' }

      // Subscribe via PushManager
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const p256dhKey = sub.getKey('p256dh')
      const authKey   = sub.getKey('auth')

      // Include the customer's phone if available (saved to localStorage after any order)
      // This links the push subscription to the customer identity for targeted sends.
      const savedPhone = (() => { try { return localStorage.getItem('kr-customer-phone') || '' } catch { return '' } })()

      // Save to backend
      const body = {
        endpoint:      sub.endpoint,
        p256dh:        ab2b64(p256dhKey),
        auth:          ab2b64(authKey),
        customerPhone: savedPhone || undefined,
      }
      if (orderId) body.orderId = orderId

      const res = await fetch('/api/push-subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })

      if (!res.ok) {
        console.warn('[push] Backend subscribe failed:', await res.text())
      }

      setIsSubscribed(true)
      return { ok: true }
    } catch (err) {
      console.error('[push] Subscribe error:', err)
      return { ok: false, reason: 'error' }
    } finally {
      setLoading(false)
    }
  }, [isSupported])

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        setIsSubscribed(false)
      }
    } catch (err) {
      console.error('[push] Unsubscribe error:', err)
    }
  }, [isSupported])

  return { isSupported, permission, isSubscribed, loading, subscribe, unsubscribe }
}
