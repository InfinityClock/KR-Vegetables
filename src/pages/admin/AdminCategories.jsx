import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { SkeletonList } from '../../components/Skeleton'
import toast from 'react-hot-toast'

function CategoryModal({ category, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: category?.name || '',
    emoji: category?.emoji || '🥬',
    display_order: category?.display_order || 0,
    is_active: category?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.name) { toast.error('Name is required'); return }
    setSaving(true)
    const { data, error } = category
      ? await supabase.from('categories').update(form).eq('id', category.id).select().single()
      : await supabase.from('categories').insert(form).select().single()
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(category ? 'Category updated!' : 'Category created!')
    onSaved(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{category ? 'Edit Category' : 'Add Category'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">✕</button>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Emoji</label>
          <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })}
            className="w-full h-11 px-4 border border-gray-200 rounded-xl text-2xl text-center outline-none focus:border-[#2D6A4F]" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Category Name *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Leafy Greens"
            className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F]" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Display Order</label>
          <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
            className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F]" />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-[#2D6A4F]" />
          <span className="text-sm font-medium text-gray-700">Active</span>
        </label>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-12 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">Cancel</button>
          <button onClick={save} disabled={saving} className="flex-1 h-12 bg-[#2D6A4F] rounded-xl text-sm font-bold text-white disabled:opacity-60">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editCat, setEditCat] = useState(null)

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('display_order')
      .then(({ data }) => { setCategories(data || []); setLoading(false) })
  }, [])

  const handleToggle = async (cat) => {
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id)
    setCategories((prev) => prev.map((c) => c.id === cat.id ? { ...c, is_active: !c.is_active } : c))
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Products in this category will not be deleted.')) return
    await supabase.from('categories').delete().eq('id', id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
    toast.success('Category deleted')
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Categories</h1>
        <button
          onClick={() => { setEditCat(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 h-10 bg-[#2D6A4F] text-white rounded-xl text-sm font-semibold"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <SkeletonList count={6} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <div key={cat.id} className={`flex items-center gap-4 px-4 py-3 ${!cat.is_active ? 'opacity-50' : ''}`}>
                <GripVertical size={16} className="text-gray-300 cursor-grab" />
                <div className="text-2xl">{cat.emoji}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-400">Order: {cat.display_order}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggle(cat)}>
                    {cat.is_active
                      ? <ToggleRight size={24} className="text-[#2D6A4F]" />
                      : <ToggleLeft size={24} className="text-gray-300" />
                    }
                  </button>
                  <button onClick={() => { setEditCat(cat); setShowModal(true) }}
                    className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Edit2 size={14} className="text-blue-600" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)}
                    className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <CategoryModal
          category={editCat}
          onClose={() => { setShowModal(false); setEditCat(null) }}
          onSaved={(cat) => {
            setCategories((prev) => editCat
              ? prev.map((c) => c.id === cat.id ? cat : c)
              : [...prev, cat].sort((a, b) => a.display_order - b.display_order)
            )
          }}
        />
      )}
    </div>
  )
}
