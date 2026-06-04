import { useState, useEffect, useCallback } from 'react'
import {
  Bell, Send, Users, Zap, ShoppingBag, Tag, Megaphone,
  CheckCircle, AlertCircle, Loader, Smartphone, Monitor,
  Trash2, RefreshCw, Clock, Target, History,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { formatDateTime } from '../../utils/format'
import toast from 'react-hot-toast'

// ─── Quick-fill templates ─────────────────────────────────────────────────────
const TEMPLATES = [
  { id: 'offer',    icon: Tag,       label: 'Special Offer',  color: '#f97316', bg: '#fff7ed', title: '🎉 Special Offer Today!',       body: 'Fresh deals on vegetables and fruits. Limited time only. Shop now!', url: '/shop' },
  { id: 'arrival',  icon: ShoppingBag, label: 'New Arrivals', color: '#0891b2', bg: '#ecfeff', title: '🌿 Fresh Stock Just In!',          body: 'New arrivals are here. Exotic vegetables, seasonal fruits, and more.', url: '/shop' },
  { id: 'delivery', icon: Zap,       label: 'Delivery Update',color: '#7c3aed', bg: '#f5f3ff', title: '🚚 Delivery Slots Open',          body: 'Morning and afternoon delivery slots are available. Order before 6 PM!', url: '/' },
  { id: 'custom',   icon: Megaphone, label: 'Custom',         color: '#2D6A4F', bg: '#f0fdf4', title: '',                                body: '', url: '/' },
]

// ─── Send targets (Phase D) ───────────────────────────────────────────────────
const SEND_TARGETS = [
  { key: 'all',           label: 'All subscribers',  desc: 'Broadcast to everyone', icon: '📢' },
  { key: 'recent_buyers', label: 'Recent buyers',    desc: 'Subscribers with a linked order', icon: '🛒' },
  { key: 'cod_customers', label: 'COD customers',    desc: 'Nudge them to try online payment', icon: '💵' },
]

// ─── Platform icon helper ─────────────────────────────────────────────────────
function PlatformIcon({ platform }) {
  if (platform === 'android' || platform === 'ios') return <Smartphone size={13} style={{ color: 'var(--text-muted)' }} />
  return <Monitor size={13} style={{ color: 'var(--text-muted)' }} />
}

function platformLabel(ua = '') {
  const u = ua.toLowerCase()
  if (u.includes('iphone') || u.includes('ipad')) return 'iOS'
  if (u.includes('android')) return 'Android'
  if (u.includes('chrome')) return 'Chrome'
  if (u.includes('firefox')) return 'Firefox'
  if (u.includes('safari')) return 'Safari'
  return 'Desktop'
}

// ─── Tab pill ────────────────────────────────────────────────────────────────
function TabPill({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 34, padding: '0 14px', borderRadius: 99, flexShrink: 0,
        fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: active ? 700 : 500,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        border: active ? 'none' : '1.5px solid var(--border)',
        background: active ? 'var(--brand-800)' : 'var(--bg-card)',
        color: active ? '#fff' : 'var(--text-mid)',
      }}
    >
      {label}
      {count != null && (
        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: active ? 'rgba(255,255,255,.2)' : 'var(--gray-100)', color: active ? '#fff' : 'var(--text-muted)' }}>
          {count}
        </span>
      )}
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminNotifications() {
  const { session } = useAuthStore()
  const token = session?.access_token

  const [tab, setTab] = useState('compose')  // 'compose' | 'subscribers' | 'history'

  // ── Compose state ──────────────────────────────────────────────────────────
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [title,   setTitle]   = useState('')
  const [body,    setBody]     = useState('')
  const [url,     setUrl]      = useState('/')
  const [target,  setTarget]  = useState('all')
  const [sending, setSending] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  // ── Subscriber state ───────────────────────────────────────────────────────
  const [subscribers,    setSubscribers]    = useState([])
  const [loadingSubs,    setLoadingSubs]    = useState(false)
  const [deletingId,     setDeletingId]     = useState(null)

  // ── History state ──────────────────────────────────────────────────────────
  const [history,        setHistory]        = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // ── Subscriber count (for compose button label) ────────────────────────────
  const [subCount, setSubCount] = useState(null)

  // ── Diagnostics state ─────────────────────────────────────────────────────
  const [diagRunning, setDiagRunning] = useState(false)
  const [diagResult,  setDiagResult]  = useState(null)

  // Load sub count on mount
  useEffect(() => {
    if (!token) return
    fetch('/api/push-send', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setSubCount(d.total ?? 0))
      .catch(() => setSubCount(0))
  }, [token])

  // ── Run diagnostics + optional test push ──────────────────────────────────
  const runDiagnostics = async (sendTest = false) => {
    if (!token) return
    setDiagRunning(true)
    setDiagResult(null)
    try {
      const res = await fetch('/api/push-test', {
        method:  sendTest ? 'POST' : 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setDiagResult(data)
    } catch (err) {
      setDiagResult({ error: err.message })
    } finally {
      setDiagRunning(false)
    }
  }

  // Load subscribers when that tab is opened
  const loadSubscribers = useCallback(async () => {
    setLoadingSubs(true)
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('id, customer_phone, platform, user_agent, created_at, order_id')
      .order('created_at', { ascending: false })
      .limit(100)
    if (!error) setSubscribers(data || [])
    setSubCount(data?.length ?? 0)
    setLoadingSubs(false)
  }, [])

  // Load history when that tab is opened
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true)
    const { data, error } = await supabase
      .from('notification_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(30)
    if (!error) setHistory(data || [])
    setLoadingHistory(false)
  }, [])

  useEffect(() => {
    if (tab === 'subscribers') loadSubscribers()
    if (tab === 'history')     loadHistory()
  }, [tab, loadSubscribers, loadHistory])

  // ── Delete subscriber ──────────────────────────────────────────────────────
  const deleteSubscriber = async (id) => {
    if (!confirm('Remove this subscriber?')) return
    setDeletingId(id)
    await supabase.from('push_subscriptions').delete().eq('id', id)
    setSubscribers(prev => prev.filter(s => s.id !== id))
    setSubCount(prev => Math.max(0, (prev ?? 1) - 1))
    setDeletingId(null)
    toast.success('Subscriber removed')
  }

  // ── Template apply ─────────────────────────────────────────────────────────
  const applyTemplate = (tpl) => {
    setSelectedTemplate(tpl.id)
    setTitle(tpl.title)
    setBody(tpl.body)
    setUrl(tpl.url)
  }

  // ── Send notification ──────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!title.trim() || !body.trim()) { toast.error('Title and message are required'); return }
    if (!token) { toast.error('Not authenticated'); return }
    setSending(true)
    setLastResult(null)
    try {
      const res = await fetch('/api/push-send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ title: title.trim(), body: body.trim(), url: url.trim() || '/', target }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Send failed')
      setLastResult(data)
      if (data.sent > 0) {
        toast.success(`Sent to ${data.sent} subscriber${data.sent !== 1 ? 's' : ''}!`)
      } else {
        toast('No active subscribers to notify', { icon: '📭' })
      }
      // Refresh count
      fetch('/api/push-send', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setSubCount(d.total ?? 0)).catch(() => {})
    } catch (err) {
      toast.error(err.message || 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  const isValid   = title.trim().length > 0 && body.trim().length > 0

  const s = { fontFamily: 'var(--font-body)' }

  return (
    <div style={{ padding: '24px 24px 60px', maxWidth: 720, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={18} style={{ color: 'var(--brand-600)' }} />
          </div>
          <h1 style={{ ...s, fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-dark)', letterSpacing: '-.03em', margin: 0 }}>
            Push Notifications
          </h1>
        </div>
        <p style={{ ...s, fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          Broadcast to customers · Manage subscribers · View history
        </p>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { icon: Users,   label: 'Total Subscribers', value: subCount ?? '—',     color: 'var(--brand-600)', bg: 'var(--brand-50)' },
          { icon: CheckCircle, label: 'Last Sent',     value: lastResult ? `${lastResult.sent}/${lastResult.total}` : '—', color: '#16a34a', bg: '#f0fdf4' },
          { icon: History, label: 'Notifications Sent', value: history.length > 0 ? history.length : '—', color: '#7c3aed', bg: '#f5f3ff' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p style={{ ...s, fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>{label}</p>
              <p style={{ ...s, fontSize: 22, fontWeight: 700, color: 'var(--text-dark)', margin: 0, letterSpacing: '-.02em' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <TabPill label="Compose"     active={tab === 'compose'}     onClick={() => setTab('compose')} />
        <TabPill label="Subscribers" active={tab === 'subscribers'} onClick={() => setTab('subscribers')} count={subCount} />
        <TabPill label="History"     active={tab === 'history'}     onClick={() => setTab('history')} />
        <TabPill label="🔧 Diagnostics" active={tab === 'diagnostics'} onClick={() => setTab('diagnostics')} />
      </div>

      {/* ════════════════════════════════════════════════════════
          COMPOSE TAB
          ════════════════════════════════════════════════════════ */}
      {tab === 'compose' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Templates */}
          <div>
            <p style={{ ...s, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Quick templates</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {TEMPLATES.map(tpl => {
                const Icon = tpl.icon
                const isActive = selectedTemplate === tpl.id
                return (
                  <button key={tpl.id} onClick={() => applyTemplate(tpl)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: isActive ? tpl.bg : 'var(--bg-card)', border: `1.5px solid ${isActive ? tpl.color : 'var(--border-light)'}`, borderRadius: 12, cursor: 'pointer', transition: 'all .15s', textAlign: 'left' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: tpl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} style={{ color: tpl.color }} />
                    </div>
                    <span style={{ ...s, fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>{tpl.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Target selection (Phase D) */}
          <div>
            <p style={{ ...s, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Target size={12} /> Send to
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SEND_TARGETS.map(tgt => (
                <button key={tgt.key} onClick={() => setTarget(tgt.key)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: target === tgt.key ? 'var(--brand-50)' : 'var(--bg-card)', border: `1.5px solid ${target === tgt.key ? 'var(--brand-300)' : 'var(--border-light)'}`, borderRadius: 12, cursor: 'pointer', transition: 'all .15s', textAlign: 'left' }}>
                  <span style={{ fontSize: 20 }}>{tgt.icon}</span>
                  <div>
                    <p style={{ ...s, fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', margin: 0 }}>{tgt.label}</p>
                    <p style={{ ...s, fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{tgt.desc}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', border: `2px solid ${target === tgt.key ? 'var(--brand-700)' : 'var(--border)'}`, background: target === tgt.key ? 'var(--brand-700)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {target === tgt.key && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Composer */}
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 16, padding: '20px 20px 24px', boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ ...s, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 0, marginBottom: 16 }}>Compose message</p>

            {/* Title */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ ...s, display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 5 }}>Notification Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 🎉 Special Offer Today!" maxLength={65}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', ...s, fontSize: 14, color: 'var(--text-dark)', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 10, outline: 'none' }}
                onFocus={e => { e.target.style.borderColor = 'var(--brand-500)' }}
                onBlur={e =>  { e.target.style.borderColor = 'var(--border)' }}
              />
              <p style={{ ...s, fontSize: 10.5, color: 'var(--text-light)', marginTop: 4, marginBottom: 0 }}>{title.length}/65</p>
            </div>

            {/* Body */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ ...s, display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 5 }}>Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message here…" rows={3} maxLength={200}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', ...s, fontSize: 14, color: 'var(--text-dark)', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 10, outline: 'none', resize: 'vertical' }}
                onFocus={e => { e.target.style.borderColor = 'var(--brand-500)' }}
                onBlur={e =>  { e.target.style.borderColor = 'var(--border)' }}
              />
              <p style={{ ...s, fontSize: 10.5, color: body.length > 180 ? '#dc2626' : 'var(--text-light)', marginTop: 4, marginBottom: 0 }}>{body.length}/200</p>
            </div>

            {/* URL */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ ...s, display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 5 }}>Tap destination</label>
              <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="/ (home), /shop, /orders, …"
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', ...s, fontSize: 13, color: 'var(--text-dark)', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 10, outline: 'none' }}
                onFocus={e => { e.target.style.borderColor = 'var(--brand-500)' }}
                onBlur={e =>  { e.target.style.borderColor = 'var(--border)' }}
              />
            </div>

            {/* Preview */}
            {(title || body) && (
              <div style={{ background: '#1e1e2e', borderRadius: 12, padding: '12px 14px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <img src="/favicon.jpg" alt="" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, objectFit: 'cover' }} />
                <div>
                  <p style={{ ...s, fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 3px' }}>{title || 'Notification Title'}</p>
                  <p style={{ ...s, fontSize: 12, color: 'rgba(255,255,255,.65)', margin: 0, lineHeight: 1.4 }}>{body || 'Message preview…'}</p>
                </div>
              </div>
            )}

            {/* Send button */}
            <button onClick={handleSend} disabled={!isValid || sending}
              style={{ width: '100%', height: 48, background: isValid && !sending ? 'var(--brand-800)' : 'var(--border)', color: isValid && !sending ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: 12, cursor: isValid && !sending ? 'pointer' : 'not-allowed', ...s, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {sending
                ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</>
                : <><Send size={15} /> Send to {target === 'all' ? (subCount ?? '…') : target === 'recent_buyers' ? 'recent buyers' : 'COD customers'}</>
              }
            </button>

            {subCount === 0 && (
              <p style={{ ...s, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10, marginBottom: 0 }}>
                No subscribers yet. Customers can enable notifications after placing an order.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          SUBSCRIBERS TAB
          ════════════════════════════════════════════════════════ */}
      {tab === 'subscribers' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ ...s, fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''} · devices registered
            </p>
            <button onClick={loadSubscribers} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, ...s, fontSize: 12, color: 'var(--text-mid)' }}>
              <RefreshCw size={12} style={{ animation: loadingSubs ? 'spin 1s linear infinite' : 'none' }} /> Refresh
            </button>
          </div>

          {loadingSubs ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton rounded-2xl" style={{ height: 60 }} />)}
            </div>
          ) : subscribers.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
              <Users size={36} style={{ color: 'var(--brand-200)', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ ...s, fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', margin: '0 0 4px' }}>No subscribers yet</p>
              <p style={{ ...s, fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                Customers who enable notifications after placing an order will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {subscribers.map(sub => (
                <div key={sub.id} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-xs)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: sub.platform === 'android' || sub.platform === 'ios' ? '#f0fdf4' : '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <PlatformIcon platform={sub.platform} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <p style={{ ...s, fontSize: 13, fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>
                        {sub.customer_phone ? `+91 ${sub.customer_phone}` : 'Unknown device'}
                      </p>
                      <span style={{ ...s, fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: 'var(--brand-50)', color: 'var(--brand-700)' }}>
                        {platformLabel(sub.user_agent)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ ...s, fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                        <Clock size={10} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                        Subscribed {formatDateTime(sub.created_at)}
                      </p>
                      {sub.order_id && (
                        <span style={{ ...s, fontSize: 10, color: '#16a34a', fontWeight: 600 }}>✓ Linked</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSubscriber(sub.id)}
                    disabled={deletingId === sub.id}
                    style={{ width: 32, height: 32, borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    title="Remove subscriber"
                  >
                    {deletingId === sub.id ? <Loader size={12} style={{ color: '#DC2626', animation: 'spin 1s linear infinite' }} /> : <Trash2 size={12} style={{ color: '#DC2626' }} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          HISTORY TAB
          ════════════════════════════════════════════════════════ */}
      {tab === 'history' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ ...s, fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Last 30 notifications sent</p>
            <button onClick={loadHistory} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, ...s, fontSize: 12, color: 'var(--text-mid)' }}>
              <RefreshCw size={12} style={{ animation: loadingHistory ? 'spin 1s linear infinite' : 'none' }} /> Refresh
            </button>
          </div>

          {loadingHistory ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton rounded-2xl" style={{ height: 72 }} />)}
            </div>
          ) : history.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
              <History size={36} style={{ color: 'var(--brand-200)', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ ...s, fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', margin: '0 0 4px' }}>No notifications sent yet</p>
              <p style={{ ...s, fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                Notifications you send will appear here with delivery stats.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.map(log => {
                const deliveryRate = log.recipient_count > 0 ? Math.round((log.sent_count / log.recipient_count) * 100) : 0
                return (
                  <div key={log.id} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 14, padding: '14px 16px', boxShadow: 'var(--shadow-xs)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ ...s, fontSize: 13, fontWeight: 700, color: 'var(--text-dark)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.title}
                        </p>
                        <p style={{ ...s, fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.body}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ ...s, fontSize: 11, color: 'var(--text-muted)' }}>
                            <Clock size={10} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                            {formatDateTime(log.sent_at)}
                          </span>
                          <span style={{ ...s, fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: 'var(--brand-50)', color: 'var(--brand-700)' }}>
                            {log.target === 'all' ? 'All subscribers' : log.target === 'recent_buyers' ? 'Recent buyers' : 'COD customers'}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ ...s, fontSize: 18, fontWeight: 800, color: log.failed_count > 0 ? '#d97706' : '#16a34a', margin: 0, letterSpacing: '-.02em' }}>
                          {deliveryRate}%
                        </p>
                        <p style={{ ...s, fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>
                          {log.sent_count}/{log.recipient_count} delivered
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          DIAGNOSTICS TAB
          ════════════════════════════════════════════════════════ */}
      {tab === 'diagnostics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={{ ...s, fontSize: 13, color: 'var(--text-muted)' }}>
            Use these tools to find out exactly why push notifications are or aren't working.
            The test push sends a real notification to a subscriber and shows the push service's response.
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => runDiagnostics(false)} disabled={diagRunning}
              style={{ height: 38, padding: '0 16px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-card)', ...s, fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              {diagRunning ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
              Check Configuration
            </button>
            <button onClick={() => runDiagnostics(true)} disabled={diagRunning}
              style={{ height: 38, padding: '0 16px', borderRadius: 10, border: 'none', background: 'var(--brand-700)', ...s, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              {diagRunning ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
              Send Test Push
            </button>
          </div>

          {/* Results */}
          {diagResult && (
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 14, padding: 16, overflow: 'auto' }}>
              {/* VAPID status */}
              {diagResult.diagnostics?.vapid && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ ...s, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', marginBottom: 8 }}>VAPID Configuration</p>
                  <div style={{ ...s, fontSize: 13, padding: '10px 14px', borderRadius: 10, background: diagResult.diagnostics.vapid.keys_match ? '#f0fdf4' : '#fef2f2', border: `1px solid ${diagResult.diagnostics.vapid.keys_match ? '#bbf7d0' : '#fecaca'}`, marginBottom: 8 }}>
                    {diagResult.diagnostics.vapid.status}
                  </div>
                  <pre style={{ ...s, fontSize: 11, background: 'var(--gray-50)', padding: 12, borderRadius: 8, overflow: 'auto', color: 'var(--text-mid)', margin: 0 }}>
                    {JSON.stringify(diagResult.diagnostics.vapid, null, 2)}
                  </pre>
                </div>
              )}

              {/* Subscribers */}
              {diagResult.diagnostics?.subscribers && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ ...s, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', marginBottom: 8 }}>Subscriptions</p>
                  <pre style={{ ...s, fontSize: 11, background: 'var(--gray-50)', padding: 12, borderRadius: 8, overflow: 'auto', color: 'var(--text-mid)', margin: 0 }}>
                    {JSON.stringify(diagResult.diagnostics.subscribers, null, 2)}
                  </pre>
                </div>
              )}

              {/* Test push result */}
              {diagResult.test_push && (
                <div>
                  <p style={{ ...s, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', marginBottom: 8 }}>Test Push Result</p>
                  <div style={{ ...s, fontSize: 13, padding: '10px 14px', borderRadius: 10, background: diagResult.test_push.success ? '#f0fdf4' : '#fef2f2', border: `1px solid ${diagResult.test_push.success ? '#bbf7d0' : '#fecaca'}`, marginBottom: 8 }}>
                    {diagResult.test_push.success ? diagResult.test_push.message : diagResult.test_push.diagnosis || diagResult.test_push.error_body || 'Unknown error'}
                  </div>
                  <pre style={{ ...s, fontSize: 11, background: 'var(--gray-50)', padding: 12, borderRadius: 8, overflow: 'auto', color: 'var(--text-mid)', margin: 0 }}>
                    {JSON.stringify(diagResult.test_push, null, 2)}
                  </pre>
                </div>
              )}

              {/* Error */}
              {diagResult.error && (
                <p style={{ ...s, fontSize: 13, color: '#dc2626' }}>{diagResult.error}</p>
              )}
            </div>
          )}

          {/* VAPID key fix instructions */}
          <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ ...s, fontSize: 12, fontWeight: 700, color: '#713f12', marginBottom: 6 }}>How to generate correct VAPID keys</p>
            <p style={{ ...s, fontSize: 12, color: '#854d0e', lineHeight: 1.6, margin: 0 }}>
              Run: <code style={{ background: 'rgba(0,0,0,.06)', padding: '1px 6px', borderRadius: 4 }}>npx web-push generate-vapid-keys</code><br />
              Set <strong>VAPID_PUBLIC_KEY</strong> and <strong>VITE_VAPID_PUBLIC_KEY</strong> to the same public key.<br />
              Set <strong>VAPID_PRIVATE_KEY</strong> to the private key.<br />
              Both must be set in Vercel → Settings → Environment Variables.<br />
              After updating keys, all users must re-subscribe (clear app data and enable notifications again).
            </p>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
