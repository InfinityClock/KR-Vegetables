import { useState, useEffect } from 'react'
import { Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { DELIVERY_SLOTS } from '../../constants'
import toast from 'react-hot-toast'

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

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
    setSaving(true)
    const entries = Object.entries(settings)
    for (const [key, value] of entries) {
      await supabase
        .from('store_settings')
        .upsert({ key, value: String(value) }, { onConflict: 'key' })
    }
    setSaving(false)
    toast.success('Settings saved!')
  }

  const toggleStoreOpen = async () => {
    const newVal = settings.store_open === 'true' ? 'false' : 'true'
    updateSetting('store_open', newVal)
    await supabase.from('store_settings').upsert({ key: 'store_open', value: newVal }, { onConflict: 'key' })
    toast.success(newVal === 'true' ? 'Store is now OPEN 🟢' : 'Store is now CLOSED 🔴')
  }

  if (loading) return <div className="p-6"><div className="skeleton h-64 rounded-2xl" /></div>

  const storeOpen = settings.store_open === 'true'

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Settings</h1>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-4 h-10 bg-[#2D6A4F] text-white rounded-xl text-sm font-semibold disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {/* Store Status */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h2 className="text-sm font-bold text-gray-800 mb-4">Store Status</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Store Open/Closed</p>
            <p className="text-xs text-gray-500 mt-0.5">Toggle to control if customers can place orders</p>
          </div>
          <button onClick={toggleStoreOpen} className="flex items-center gap-2">
            {storeOpen
              ? <><ToggleRight size={32} className="text-[#2D6A4F]" /><span className="text-sm font-semibold text-green-600">OPEN</span></>
              : <><ToggleLeft size={32} className="text-gray-300" /><span className="text-sm font-semibold text-red-500">CLOSED</span></>
            }
          </button>
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
        <h2 className="text-sm font-bold text-gray-800">Delivery Settings</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Delivery Fee (₹)</label>
            <input
              type="number"
              value={settings.delivery_fee || ''}
              onChange={(e) => updateSetting('delivery_fee', e.target.value)}
              className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Min Order Amount (₹)</label>
            <input
              type="number"
              value={settings.min_order_amount || ''}
              onChange={(e) => updateSetting('min_order_amount', e.target.value)}
              className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F]"
            />
          </div>
        </div>
      </div>

      {/* Store Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
        <h2 className="text-sm font-bold text-gray-800">Store Information</h2>

        {[
          { key: 'store_name', label: 'Store Name', placeholder: 'KR Vegetables & Fruits' },
          { key: 'whatsapp_number', label: 'WhatsApp Number', placeholder: '+91 98765 43210' },
          { key: 'store_address', label: 'Store Address', placeholder: 'Full address' },
          { key: 'upi_id', label: 'UPI ID', placeholder: 'yourstore@upi' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>
            <input
              value={settings[key] || ''}
              onChange={(e) => updateSetting(key, e.target.value)}
              placeholder={placeholder}
              className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F]"
            />
          </div>
        ))}
      </div>

      {/* Razorpay Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <h2 className="text-sm font-bold text-gray-800">Payment (Razorpay)</h2>
        <div className="bg-yellow-50 rounded-xl p-3 text-xs text-yellow-700">
          ⚠️ Razorpay keys are set via environment variables (VITE_RAZORPAY_KEY_ID). Never store secret keys here.
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Current Key ID</label>
          <div className="h-11 px-4 border border-gray-200 rounded-xl flex items-center text-sm text-gray-500 bg-gray-50">
            {import.meta.env.VITE_RAZORPAY_KEY_ID
              ? `${import.meta.env.VITE_RAZORPAY_KEY_ID.slice(0, 8)}••••••••`
              : 'Not configured'
            }
          </div>
        </div>
      </div>
    </div>
  )
}
