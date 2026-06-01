import { useState, useEffect } from 'react'
import { Bell, Send, Users, Zap, ShoppingBag, Tag, Megaphone, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

// ─── Quick-fill templates ─────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id:    'offer',
    icon:  Tag,
    label: 'Special Offer',
    color: '#f97316',
    bg:    '#fff7ed',
    title: '🎉 Special Offer Today!',
    body:  'Fresh deals on vegetables & fruits — limited time only. Shop now!',
    url:   '/shop',
  },
  {
    id:    'arrival',
    icon:  ShoppingBag,
    label: 'New Arrivals',
    color: '#0891b2',
    bg:    '#ecfeff',
    title: '🌿 Fresh Stock Just In!',
    body:  'New arrivals are here — exotic vegetables, seasonal fruits, and more.',
    url:   '/shop',
  },
  {
    id:    'delivery',
    icon:  Zap,
    label: 'Delivery Update',
    color: '#7c3aed',
    bg:    '#f5f3ff',
    title: '🚚 Delivery Slots Open',
    body:  'Morning and afternoon delivery slots are available. Order before 6 PM!',
    url:   '/',
  },
  {
    id:    'custom',
    icon:  Megaphone,
    label: 'Custom',
    color: '#2D6A4F',
    bg:    '#f0fdf4',
    title: '',
    body:  '',
    url:   '/',
  },
]

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = 'var(--brand-600)', bg = 'var(--brand-50)', loading = false }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1.5px solid var(--border-light)',
      borderRadius: 14,
      padding: '18px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>{label}</p>
        {loading
          ? <div className="skeleton" style={{ width: 48, height: 28, borderRadius: 6, marginTop: 4 }} />
          : <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--text-dark)', margin: 0, letterSpacing: '-.02em' }}>{value ?? '—'}</p>
        }
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminNotifications() {
  const { session } = useAuthStore()
  const token = session?.access_token

  const [subscriberCount, setSubscriberCount] = useState(null)
  const [loadingStats, setLoadingStats]       = useState(true)

  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [title, setTitle]   = useState('')
  const [body, setBody]     = useState('')
  const [url, setUrl]       = useState('/')
  const [sending, setSending] = useState(false)
  const [lastResult, setLastResult] = useState(null)  // { sent, failed, total }

  // Load subscriber count
  useEffect(() => {
    if (!token) return
    fetch('/api/push-send', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setSubscriberCount(d.total ?? 0))
      .catch(() => setSubscriberCount(0))
      .finally(() => setLoadingStats(false))
  }, [token])

  function applyTemplate(tpl) {
    setSelectedTemplate(tpl.id)
    setTitle(tpl.title)
    setBody(tpl.body)
    setUrl(tpl.url)
  }

  async function handleSend() {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and message are required')
      return
    }
    if (!token) { toast.error('Not authenticated'); return }
    setSending(true)
    setLastResult(null)
    try {
      const res = await fetch('/api/push-send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), url: url.trim() || '/' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Send failed')
      setLastResult(data)
      if (data.sent > 0) {
        toast.success(`Sent to ${data.sent} subscriber${data.sent !== 1 ? 's' : ''}!`)
      } else {
        toast(`No active subscribers to notify`, { icon: '📭' })
      }
      // Refresh subscriber count (stale ones may have been pruned)
      fetch('/api/push-send', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => setSubscriberCount(d.total ?? 0))
        .catch(() => {})
    } catch (err) {
      toast.error(err.message || 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  const charCount = body.length
  const isValid   = title.trim().length > 0 && body.trim().length > 0

  return (
    <div style={{ padding: '28px 24px 60px', maxWidth: 680, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={18} style={{ color: 'var(--brand-600)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-dark)', letterSpacing: '-.03em', margin: 0 }}>
            Push Notifications
          </h1>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          Broadcast messages to all customers who enabled notifications.
        </p>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard
          icon={Users}
          label="Subscribers"
          value={loadingStats ? '—' : subscriberCount}
          loading={loadingStats}
          color="var(--brand-600)"
          bg="var(--brand-50)"
        />
        {lastResult && (
          <StatCard
            icon={lastResult.sent > 0 ? CheckCircle : AlertCircle}
            label="Last Send"
            value={`${lastResult.sent}/${lastResult.total}`}
            color={lastResult.sent > 0 ? '#16a34a' : '#dc2626'}
            bg={lastResult.sent > 0 ? '#f0fdf4' : '#fef2f2'}
          />
        )}
      </div>

      {/* ── Templates ── */}
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
          Quick templates
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {TEMPLATES.map((tpl) => {
            const Icon    = tpl.icon
            const isActive = selectedTemplate === tpl.id
            return (
              <button
                key={tpl.id}
                onClick={() => applyTemplate(tpl)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px',
                  background: isActive ? tpl.bg : 'var(--bg-card)',
                  border: `1.5px solid ${isActive ? tpl.color : 'var(--border-light)'}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'all .15s',
                  textAlign: 'left',
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 9, background: tpl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color: tpl.color }} />
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>
                  {tpl.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Composer ── */}
      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 16, padding: '20px 20px 24px', boxShadow: 'var(--shadow-sm)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 0, marginBottom: 16 }}>
          Compose message
        </p>

        {/* Title */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--text-mid)', marginBottom: 5 }}>
            Notification Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 🎉 Special Offer Today!"
            maxLength={65}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 12px',
              fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dark)',
              background: 'var(--bg-base)',
              border: '1.5px solid var(--border)',
              borderRadius: 10, outline: 'none',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--brand-500)'}
            onBlur={(e)  => e.target.style.borderColor = 'var(--border)'}
          />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', color: 'var(--text-light)', marginTop: 4, marginBottom: 0 }}>
            {title.length}/65 characters
          </p>
        </div>

        {/* Body */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--text-mid)', marginBottom: 5 }}>
            Message
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message here…"
            rows={3}
            maxLength={200}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 12px',
              fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dark)',
              background: 'var(--bg-base)',
              border: '1.5px solid var(--border)',
              borderRadius: 10, outline: 'none', resize: 'vertical',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--brand-500)'}
            onBlur={(e)  => e.target.style.borderColor = 'var(--border)'}
          />
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '10.5px',
            color: charCount > 180 ? '#dc2626' : 'var(--text-light)',
            marginTop: 4, marginBottom: 0,
          }}>
            {charCount}/200 characters
          </p>
        </div>

        {/* URL */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--text-mid)', marginBottom: 5 }}>
            Tap destination
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/ (home), /shop, /orders, …"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 12px',
              fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-dark)',
              background: 'var(--bg-base)',
              border: '1.5px solid var(--border)',
              borderRadius: 10, outline: 'none',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--brand-500)'}
            onBlur={(e)  => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Preview */}
        {(title || body) && (
          <div style={{
            background: '#1e1e2e',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <img src="/favicon.jpg" alt="" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, objectFit: 'cover' }} />
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: '#fff', margin: '0 0 3px' }}>
                {title || 'Notification Title'}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,.65)', margin: 0, lineHeight: 1.4 }}>
                {body || 'Message preview…'}
              </p>
            </div>
          </div>
        )}

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!isValid || sending}
          style={{
            width: '100%', height: 48,
            background: isValid && !sending ? 'var(--brand-800)' : 'var(--border)',
            color: isValid && !sending ? '#fff' : 'var(--text-muted)',
            border: 'none', borderRadius: 12, cursor: isValid && !sending ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background .2s',
          }}
        >
          {sending
            ? <><Loader size={16} className="animate-spin" /> Sending…</>
            : <><Send size={15} /> Send to {subscriberCount ?? '…'} subscriber{subscriberCount !== 1 ? 's' : ''}</>
          }
        </button>

        {subscriberCount === 0 && !loadingStats && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: 10, marginBottom: 0 }}>
            No subscribers yet. Customers can enable notifications after placing an order.
          </p>
        )}
      </div>

      {/* ── Info box ── */}
      <div style={{
        marginTop: 20,
        background: 'var(--brand-50)',
        border: '1px solid var(--brand-100)',
        borderRadius: 12,
        padding: '14px 16px',
      }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--brand-800)', margin: 0, lineHeight: 1.55 }}>
          <strong>📱 How it works:</strong> Customers who install the app and allow notifications after placing an order will receive these messages on their phone — even when the browser is closed.
          Order status notifications (confirmed, out for delivery, delivered) are sent automatically.
        </p>
      </div>

    </div>
  )
}
