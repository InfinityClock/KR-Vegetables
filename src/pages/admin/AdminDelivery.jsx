import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Clock } from 'lucide-react'
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
    await supabase
      .from('store_settings')
      .upsert({ key: 'delivery_slots', value: JSON.stringify(slots) }, { onConflict: 'key' })
    setSaving(false)
    toast.success('Delivery slots saved!')
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Delivery Settings</h1>
        <button
          onClick={saveSlots}
          disabled={saving}
          className="flex items-center gap-2 px-4 h-10 bg-[#2D6A4F] text-white rounded-xl text-sm font-semibold"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <Clock size={16} className="text-[#2D6A4F]" />
          Delivery Slots
        </h2>

        {/* Current slots */}
        {loading ? (
          <div className="skeleton h-24 rounded-xl" />
        ) : (
          <div className="space-y-2">
            {slots.map((slot) => (
              <div key={slot} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-800">{slot}</span>
                <button onClick={() => removeSlot(slot)} className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
                  <Trash2 size={13} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add slot */}
        <div className="flex gap-2">
          <input
            value={newSlot}
            onChange={(e) => setNewSlot(e.target.value)}
            placeholder="e.g. Morning 7AM–10AM"
            className="flex-1 h-11 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F]"
            onKeyDown={(e) => e.key === 'Enter' && addSlot()}
          />
          <button
            onClick={addSlot}
            className="w-11 h-11 bg-[#2D6A4F] rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <Plus size={18} className="text-white" />
          </button>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
        <p className="text-sm font-semibold text-blue-800 mb-1">💡 Note</p>
        <p className="text-xs text-blue-700">
          Delivery slots are shown to customers during checkout. Changes take effect immediately.
          Typical slots: Morning (7–10 AM), Afternoon (12–3 PM), Evening (5–8 PM).
        </p>
      </div>
    </div>
  )
}
