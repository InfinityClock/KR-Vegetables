// ─── KR Vegetables & Fruits — Service Worker ────────────────────────────────
// Handles background push notifications and notification click routing.

const APP_NAME = 'KR Vegetables & Fruits'
const ICON     = '/favicon.jpg'

// ── Push event ───────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data?.json() ?? {} } catch { /* ignore malformed payloads */ }

  const title   = data.title ?? APP_NAME
  const options = {
    body:               data.body  ?? 'You have a new update.',
    icon:               data.icon  ?? ICON,
    badge:              data.badge ?? ICON,
    data:             { url: data.url ?? '/' },
    vibrate:          [100, 50, 100],
    requireInteraction: false,
    // Tag collapses duplicate notifications (e.g. same order update sent twice)
    tag:     data.tag    ?? 'kr-notification',
    renotify: !!data.tag,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Re-use an existing tab if one is open
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus()
            if ('navigate' in client) client.navigate(url)
            return
          }
        }
        if (clients.openWindow) return clients.openWindow(url)
      })
  )
})

// ── Subscription change (auto-resubscribe when browser rotates keys) ──────────
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly:      true,
        applicationServerKey: event.oldSubscription?.options?.applicationServerKey,
      })
      .then((sub) =>
        fetch('/api/push-subscribe', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: sub.endpoint,
            p256dh:   _ab2b64(sub.getKey('p256dh')),
            auth:     _ab2b64(sub.getKey('auth')),
          }),
        })
      )
  )
})

// ── Helper ────────────────────────────────────────────────────────────────────
function _ab2b64(buffer) {
  const bytes = new Uint8Array(buffer)
  let bin = ''
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}
