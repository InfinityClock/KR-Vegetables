import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, GripVertical, Tags } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { SkeletonList } from '../../components/Skeleton'
import toast from 'react-hot-toast'

function CategoryModal({ category, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: category?.name || '',
    emoji: category?.emoji || '🥬',
    type: category?.type || 'vegetable',
    display_order: category?.display_order || 0,
    is_active: category?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return }
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 space-y-4"
        style={{ background: '#fff', boxShadow: 'var(--shadow-xl)' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Playfair Display, serif' }}>
            {category ? 'Edit Category' : 'Add Category'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ background: 'var(--gray-100)', color: 'var(--text-mid)' }}
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-mid)' }}>Emoji</label>
            <input
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              className="w-full h-11 px-4 rounded-xl text-2xl text-center outline-none transition-all"
              style={{ border: '1.5px solid var(--border)', background: 'var(--gray-50)' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.background = '#fff' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--gray-50)' }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-mid)' }}>Display Order</label>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
              className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
              style={{ border: '1.5px solid var(--border)', background: 'var(--gray-50)' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.background = '#fff' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--gray-50)' }}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-mid)' }}>Category Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Leafy Greens"
            className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
            style={{ border: '1.5px solid var(--border)', background: 'var(--gray-50)' }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.background = '#fff' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--gray-50)' }}
          />
        </div>

        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-mid)' }}>Type</label>
          <div className="flex gap-2">
            {['vegetable', 'fruit', 'other'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, type: t })}
                className="flex-1 h-10 rounded-xl text-xs font-semibold capitalize transition-all"
                style={
                  form.type === t
                    ? { background: 'var(--brand-700)', color: '#fff', border: '1.5px solid var(--brand-700)' }
                    : { background: 'var(--gray-50)', color: 'var(--text-mid)', border: '1.5px solid var(--border)' }
                }
              >
                {t === 'vegetable' ? '🥦 ' : t === 'fruit' ? '🍎 ' : '📦 '}{t}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            style={{ accentColor: 'var(--brand-600)' }}
          />
          <span className="text-sm font-medium" style={{ color: 'var(--text-dark)' }}>Active (visible to customers)</span>
        </label>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-xl text-sm font-semibold transition-colors"
            style={{ border: '1.5px solid var(--border)', color: 'var(--text-mid)', background: '#fff' }}
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 h-12 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: saving ? 'var(--brand-400)' : 'var(--brand-700)' }}
          >
            {saving ? 'Saving…' : 'Save Category'}
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
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    setCategories((prev) => prev.filter((c) => c.id !== id))
    toast.success('Category deleted')
  }

  const typeLabel = { vegetable: { label: '🥦 Veg', color: 'var(--brand-700)', bg: 'var(--brand-50)' }, fruit: { label: '🍎 Fruit', color: '#D97706', bg: '#FEF3C7' }, other: { label: '📦 Other', color: 'var(--text-mid)', bg: 'var(--gray-100)' } }

  return (
    <div className="p-4 lg:p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-dark)' }}
          >
            Categories
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {categories.filter((c) => c.is_active).length} active · {categories.length} total
          </p>
        </div>
        <button
          onClick={() => { setEditCat(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'var(--brand-700)', boxShadow: '0 2px 8px rgba(22,101,52,.25)' }}
        >
          <Plus size={15} /> Add Category
        </button>
      </div>

      {loading ? (
        <div
          className="rounded-2xl p-4"
          style={{ background: '#fff', border: '1px solid var(--border-light)' }}
        >
          <SkeletonList count={6} />
        </div>
      ) : categories.length === 0 ? (
        <div
          className="rounded-2xl py-16 flex flex-col items-center gap-3"
          style={{ background: '#fff', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}
        >
          <Tags size={36} style={{ opacity: 0.3 }} />
          <p className="text-sm">No categories yet</p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#fff', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
        >
          {categories.map((cat, idx) => {
            const tl = typeLabel[cat.type] || typeLabel.other
            return (
              <div
                key={cat.id}
                className="flex items-center gap-4 px-4 py-3.5 transition-colors"
                style={{
                  borderBottom: idx < categories.length - 1 ? '1px solid var(--border-light)' : 'none',
                  opacity: cat.is_active ? 1 : 0.45,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-50)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <GripVertical size={15} className="cursor-grab" style={{ color: 'var(--border)', flexShrink: 0 }} />
                <span className="text-2xl" style={{ flexShrink: 0 }}>{cat.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>{cat.name}</p>
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: tl.bg, color: tl.color }}
                    >
                      {tl.label}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Order: {cat.display_order}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleToggle(cat)} className="transition-opacity hover:opacity-70">
                    {cat.is_active
                      ? <ToggleRight size={26} style={{ color: 'var(--brand-600)' }} />
                      : <ToggleLeft size={26} style={{ color: 'var(--text-light)' }} />
                    }
                  </button>
                  <button
                    onClick={() => { setEditCat(cat); setShowModal(true) }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: '#EFF6FF' }}
                  >
                    <Edit2 size={13} style={{ color: '#3B82F6' }} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: '#FEF2F2' }}
                  >
                    <Trash2 size={13} style={{ color: '#DC2626' }} />
                  </button>
                </div>
              </div>
            )
          })}
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
