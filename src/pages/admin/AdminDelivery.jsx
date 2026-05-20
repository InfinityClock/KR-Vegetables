import { useState, useEffect } from 'react'
import { Save, Clock, Truck, Info, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { adminFetch } from '../../lib/adminApi'
import toast from 'react-hot-toast'

function SettingInput({ label, value, onChange, placeholder, type = 'text', hint, prefix }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-mid)' }}>{label}</label>
      <div className="relative">
        {prefix && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold"
            style={{ color: 'var(--text-muted)' }}
          >
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-11 rounded-xl text-sm outline-none transition-all"
          style={{
            paddingLeft: prefix ? 28 : 16,
            paddingRight: 16,
            border: '1.5px solid var(--border)',
            background: 'var(--gray-50)',
            color: 'var(--text-dark)',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.background = '#fff' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--gray-50)' }}
        />
      </div>
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  )
}

const WINDOWS = [
  { label: 'Morning Window', time: '8:00 AM – 1:00 PM', icon: '🌅', note: 'Orders placed before 12 noon' },
  { label: 'Afternoon Window', time: '3:00 PM – 8:00 PM', icon: '🌇', note: 'Orders placed before 7 PM' },
]

export default function AdminDelivery() {
  const [settings, setSettings] = useState({ delivery_fee: '', free_delivery_above: '', min_order_amount: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('store_settings')
      .select('*')
      .then(({ data }) => {
        const map = {}
        data?.forEach((s) => { map[s.key] = s.value })
        setSettings((prev) => ({ ...prev, ...map }))
        setLoading(false)
      })
  }, [])

  const update = (key, val) => setSettings((prev) => ({ ...prev, [key]: val }))

  const saveSettings = async () => {
    setSaving(true)
    const keys = ['delivery_fee', 'free_delivery_above', 'min_order_amount']
    await Promise.all(
      keys.map((key) =>
        adminFetch('/api/admin-write', {
          method: 'POST',
          body: JSON.stringify({
            table: 'store_settings',
            action: 'upsert',
            onConflict: 'key',
            payload: { key, value: String(settings[key]) },
          }),
        })
      )
    )
    setSaving(false)
    toast.success('Delivery settings saved!')
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dark)' }}
          >
            Delivery Settings
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Delivery windows &amp; fee configuration
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving || loading}
          className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: saving ? 'var(--brand-400)' : 'var(--brand-700)', boxShadow: '0 2px 8px rgba(22,101,52,.25)' }}
        >
          <Save size={15} />
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Delivery windows — fixed model */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: '#fff', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--brand-50)' }}
          >
            <Clock size={16} style={{ color: 'var(--brand-600)' }} />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>Delivery Windows</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Auto-assigned based on order time — no customer selection needed
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {WINDOWS.map(({ label, time, icon, note }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-xl p-4"
              style={{ background: 'var(--brand-50)', border: '1.5px solid var(--brand-100)' }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>{label}</p>
                  <CheckCircle size={13} style={{ color: 'var(--brand-600)', flexShrink: 0 }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--brand-700)' }}>{time}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div
          className="rounded-xl p-3 flex gap-2.5"
          style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
        >
          <Info size={14} style={{ color: '#2563EB', flexShrink: 0, marginTop: 1 }} />
          <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
            <strong>How it works:</strong> Orders before noon → Morning window (8AM–1PM).
            Orders before 7PM → Afternoon window (3PM–8PM).
            Orders after 7PM → next day Morning window.
            Customers see this automatically at checkout — no selection required.
          </p>
        </div>
      </div>

      {/* Delivery fee settings */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: '#fff', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--brand-50)' }}
          >
            <Truck size={16} style={{ color: 'var(--brand-600)' }} />
          </div>
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>Fee &amp; Thresholds</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-11 rounded-xl" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <SettingInput
                label="Delivery Fee (₹)"
                type="number"
                prefix="₹"
                value={settings.delivery_fee || ''}
                onChange={(v) => update('delivery_fee', v)}
                placeholder="40"
              />
              <SettingInput
                label="Free Delivery Above (₹)"
                type="number"
                prefix="₹"
                value={settings.free_delivery_above || ''}
                onChange={(v) => update('free_delivery_above', v)}
                placeholder="300"
              />
            </div>
            <SettingInput
              label="Minimum Order Amount (₹)"
              type="number"
              prefix="₹"
              value={settings.min_order_amount || ''}
              onChange={(v) => update('min_order_amount', v)}
              placeholder="150"
              hint="Customers cannot place orders below this amount"
            />
          </>
        )}
      </div>
    </div>
  )
}
