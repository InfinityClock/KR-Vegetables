import { useState, useEffect } from 'react'
import { Save, ToggleLeft, ToggleRight, Settings } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

function SettingInput({ label, value, onChange, placeholder, type = 'text', hint }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-mid)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
        style={{ border: '1.5px solid var(--border)', background: 'var(--gray-50)', color: 'var(--text-dark)' }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.background = '#fff' }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--gray-50)' }}
      />
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: '#fff', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
    >
      <h2 className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>{title}</h2>
      {children}
    </div>
  )
}

export default function AdminSettings() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('store_settings')
      .select('*')
      .then(({ data }) => {
        const map = {}
        data?.forEach((s) => { map[s.key] = s.value })
        setSettings(map)
        setLoading(false)
      })
  }, [])

  const updateSetting = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }))

  const adminUpsert = async (key, value) =>
    fetch('/api/admin-write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'store_settings', action: 'upsert', onConflict: 'key', payload: { key, value: String(value) } }),
    })

  const saveSettings = async () => {
    setSaving(true)
    await Promise.all(Object.entries(settings).map(([key, value]) => adminUpsert(key, value)))
    setSaving(false)
    toast.success('Settings saved!')
  }

  const toggleStoreOpen = async () => {
    const newVal = settings.store_open === 'true' ? 'false' : 'true'
    updateSetting('store_open', newVal)
    await adminUpsert('store_open', newVal)
    toast.success(newVal === 'true' ? 'Store is now OPEN 🟢' : 'Store is now CLOSED 🔴')
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
      </div>
    )
  }

  const storeOpen = settings.store_open === 'true'

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dark)' }}
          >
            Settings
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Configure your store</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: saving ? 'var(--brand-400)' : 'var(--brand-700)', boxShadow: '0 2px 8px rgba(22,101,52,.25)' }}
        >
          <Save size={15} />
          {saving ? 'Saving…' : 'Save All'}
        </button>
      </div>

      {/* Store Status */}
      <SectionCard title="Store Status">
        <div
          className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: storeOpen ? 'var(--brand-50)' : '#FEF2F2', border: `1.5px solid ${storeOpen ? 'var(--brand-200)' : '#FCA5A5'}` }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>
              Store is currently{' '}
              <span style={{ color: storeOpen ? 'var(--brand-700)' : '#DC2626' }}>
                {storeOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {storeOpen ? 'Customers can browse and place orders' : 'Customers cannot place new orders'}
            </p>
          </div>
          <button onClick={toggleStoreOpen} className="flex items-center gap-2 shrink-0 transition-opacity hover:opacity-80">
            {storeOpen
              ? <ToggleRight size={36} style={{ color: 'var(--brand-600)' }} />
              : <ToggleLeft size={36} style={{ color: '#DC2626' }} />
            }
          </button>
        </div>
      </SectionCard>

      {/* Delivery Settings */}
      <SectionCard title="Delivery Settings">
        <div className="grid grid-cols-2 gap-3">
          <SettingInput
            label="Delivery Fee (₹)"
            type="number"
            value={settings.delivery_fee || ''}
            onChange={(v) => updateSetting('delivery_fee', v)}
            placeholder="40"
          />
          <SettingInput
            label="Free Delivery Above (₹)"
            type="number"
            value={settings.free_delivery_above || ''}
            onChange={(v) => updateSetting('free_delivery_above', v)}
            placeholder="299"
          />
        </div>
        <SettingInput
          label="Minimum Order Amount (₹)"
          type="number"
          value={settings.min_order_amount || ''}
          onChange={(v) => updateSetting('min_order_amount', v)}
          placeholder="100"
          hint="Orders below this amount cannot be placed"
        />
      </SectionCard>

      {/* Store Information */}
      <SectionCard title="Store Information">
        <SettingInput
          label="Store Name"
          value={settings.store_name || ''}
          onChange={(v) => updateSetting('store_name', v)}
          placeholder="KR Vegetables & Fruits"
        />
        <SettingInput
          label="WhatsApp Number"
          value={settings.whatsapp_number || ''}
          onChange={(v) => updateSetting('whatsapp_number', v)}
          placeholder="+91 98765 43210"
        />
        <SettingInput
          label="Store Address"
          value={settings.store_address || ''}
          onChange={(v) => updateSetting('store_address', v)}
          placeholder="Full address"
        />
        <SettingInput
          label="UPI ID"
          value={settings.upi_id || ''}
          onChange={(v) => updateSetting('upi_id', v)}
          placeholder="yourstore@upi"
        />
      </SectionCard>

      {/* Payment */}
      <SectionCard title="Payment (Razorpay)">
        <div
          className="rounded-xl p-3 text-xs"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}
        >
          ⚠️ Razorpay keys are configured via environment variables (<code>VITE_RAZORPAY_KEY_ID</code>). Never store secret keys in the database.
        </div>
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-mid)' }}>
            Current Key ID
          </label>
          <div
            className="h-11 px-4 rounded-xl flex items-center text-sm"
            style={{ border: '1.5px solid var(--border)', background: 'var(--gray-50)', color: 'var(--text-muted)' }}
          >
            {import.meta.env.VITE_RAZORPAY_KEY_ID
              ? `${import.meta.env.VITE_RAZORPAY_KEY_ID.slice(0, 8)}••••••••`
              : 'Not configured'
            }
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
