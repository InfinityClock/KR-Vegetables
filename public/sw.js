// ─── KR Vegetables & Fruits — Service Worker ────────────────────────────────
// Handles background push notifications and notification click routing.

const APP_NAME = 'KR Vegetables & Fruits'
const ICON     = '/favicon.jpg'

// ── App icon badge counter (Badging API) ─────────────────────────────────────
// Distinct from the small `badge` icon shown inside a notification — this is
// the numeric badge on the installed PWA's home-screen/taskbar icon.
// Not supported on iOS (Apple has not implemented the Badging API for web
// apps as of writing) — calls are wrapped so they silently no-op there.
// Persisted in IndexedDB since the service worker has no localStorage access
// and is frequently terminated/restarted by the browser.
const BADGE_DB = 'kr-badge-db'
const BADGE_STORE = 'meta'
const BADGE_KEY = 'unreadCount'

function _openBadgeDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(BADGE_DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(BADGE_STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function _getBadgeCount() {
  try {
    const db = await _openBadgeDb()
    return await new Promise((resolve) => {
      const tx = db.transaction(BADGE_STORE, 'readonly')
      const req = tx.objectStore(BADGE_STORE).get(BADGE_KEY)
      req.onsuccess = () => resolve(req.result ?? 0)
      req.onerror = () => resolve(0)
    })
  } catch { return 0 }
}

async function _setBadgeCount(count) {
  try {
    const db = await _openBadgeDb()
    await new Promise((resolve) => {
      const tx = db.transaction(BADGE_STORE, 'readwrite')
      tx.objectStore(BADGE_STORE).put(count, BADGE_KEY)
      tx.oncomplete = resolve
      tx.onerror = resolve
    })
  } catch { /* IndexedDB unavailable — badge just won't persist, non-critical */ }
}

async function _incrementBadge() {
  const next = (await _getBadgeCount()) + 1
  await _setBadgeCount(next)
  if (self.navigator?.setAppBadge) {
    self.navigator.setAppBadge(next).catch(() => {})
  }
}

async function _clearBadge() {
  await _setBadgeCount(0)
  if (self.navigator?.clearAppBadge) {
    self.navigator.clearAppBadge().catch(() => {})
  }
}

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

  const isNewOrderAlert = (data.tag || '').startsWith('new-order-')

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      isNewOrderAlert ? _incrementBadge() : Promise.resolve(),
    ])
  )
})

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  const isNewOrderAlert = (event.notification.tag || '').startsWith('new-order-')

  event.waitUntil(
    Promise.all([
      isNewOrderAlert ? _clearBadge() : Promise.resolve(),
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
        }),
    ])
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

// ── Message from page (e.g. admin dashboard clearing the badge on focus) ──────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CLEAR_BADGE') event.waitUntil(_clearBadge())
})

// ── Helper ────────────────────────────────────────────────────────────────────
function _ab2b64(buffer) {
  const bytes = new Uint8Array(buffer)
  let bin = ''
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}
