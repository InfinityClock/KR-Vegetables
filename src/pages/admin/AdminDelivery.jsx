import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Clock, Truck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AdminDelivery() {
  const [slots, setSlots] = useState([])
  const [newSlot, setNewSlot] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'delivery_slots')
      .single()
      .then(({ data }) => {
        if (data) {
          try { setSlots(JSON.parse(data.value)) } catch { setSlots([]) }
        }
        setLoading(false)
      })
  }, [])

  const addSlot = () => {
    if (!newSlot.trim()) return
    if (slots.includes(newSlot.trim())) { toast.error('Slot already exists'); return }
    setSlots((prev) => [...prev, newSlot.trim()])
    setNewSlot('')
  }

  const removeSlot = (slot) => setSlots((prev) => prev.filter((s) => s !== slot))

  const saveSlots = async () => {
    setSaving(true)
    const res = await fetch('/api/admin-write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'store_settings', action: 'upsert', onConflict: 'key', payload: { key: 'delivery_slots', value: JSON.stringify(slots) } }),
    })
    setSaving(false)
    if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Save failed'); return }
    toast.success('Delivery slots saved!')
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-dark)' }}
          >
            Delivery Settings
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Manage delivery time slots
          </p>
        </div>
        <button
          onClick={saveSlots}
          disabled={saving}
          className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: saving ? 'var(--brand-400)' : 'var(--brand-700)', boxShadow: '0 2px 8px rgba(22,101,52,.25)' }}
        >
          <Save size={15} />
          {saving ? 'Saving…' : 'Save Slots'}
        </button>
      </div>

      {/* Slots Manager */}
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
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>Delivery Slots</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {slots.length} slot{slots.length !== 1 ? 's' : ''} configured
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : slots.length === 0 ? (
          <div
            className="text-center py-8 text-sm rounded-xl"
            style={{ background: 'var(--gray-50)', color: 'var(--text-muted)' }}
          >
            <Truck size={28} className="mx-auto mb-2 opacity-30" />
            No slots configured — add one below
          </div>
        ) : (
          <div className="space-y-2">
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'var(--gray-50)', border: '1px solid var(--border-light)' }}
              >
                <div className="flex items-center gap-2.5">
                  <Clock size={14} style={{ color: 'var(--brand-500)', flexShrink: 0 }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{slot}</span>
                </div>
                <button
                  onClick={() => removeSlot(slot)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: '#FEF2F2' }}
                >
                  <Trash2 size={13} style={{ color: '#DC2626' }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add slot input */}
        <div className="flex gap-2">
          <input
            value={newSlot}
            onChange={(e) => setNewSlot(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSlot()}
            placeholder="e.g. Morning 7AM – 10AM"
            className="flex-1 h-11 px-4 rounded-xl text-sm outline-none transition-all"
            style={{ border: '1.5px solid var(--border)', background: 'var(--gray-50)', color: 'var(--text-dark)' }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.background = '#fff' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--gray-50)' }}
          />
          <button
            onClick={addSlot}
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all"
            style={{ background: 'var(--brand-700)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-900)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--brand-700)' }}
          >
            <Plus size={18} style={{ color: '#fff' }} />
          </button>
        </div>
      </div>

      {/* Info box */}
      <div
        className="rounded-2xl p-4"
        style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
      >
        <p className="text-sm font-semibold mb-1" style={{ color: '#1E40AF' }}>
          💡 How delivery slots work
        </p>
        <p className="text-xs leading-relaxed" style={{ color: '#1D4ED8' }}>
          Slots appear in the customer checkout flow. Changes take effect immediately.
          Typical slots: <strong>Morning (7–10 AM)</strong>, <strong>Afternoon (12–3 PM)</strong>, <strong>Evening (5–8 PM)</strong>.
        </p>
      </div>
    </div>
  )
}
