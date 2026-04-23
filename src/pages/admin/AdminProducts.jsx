import { useState, useRef, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Image, ToggleLeft, ToggleRight, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../utils/format'
import { STOCK_STATUS, PLACEHOLDER_IMAGE } from '../../constants'
import toast from 'react-hot-toast'

// ── CSS helpers ────────────────────────────────────────────────────────────────
const input = 'w-full h-11 px-4 border border-gray-200 rounded-xl text-sm outline-none transition-colors focus:border-[#166534]'
const labelCls = 'text-xs font-semibold text-gray-600 mb-1 block'

const STOCK_OPTIONS = [
  { value: 'in_stock',    label: 'In Stock'   },
  { value: 'limited',     label: 'Limited'    },
  { value: 'out_of_stock',label: 'Out of Stock'},
]

// ── Real Supabase categories hook (NOT mock data) ──────────────────────────────
function useRealCategories() {
  const [categories, setCategories] = useState([])
  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, emoji')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => setCategories(data || []))
  }, [])
  return categories
}

// ── Product Modal ──────────────────────────────────────────────────────────────
function ProductModal({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState(product ? {
    name:         product.name,
    description:  product.description || '',
    category_id:  product.category_id,
    unit:         product.unit,
    price:        product.price,
    offer_price:  product.offer_price || '',
    offer_label:  product.offer_label || '',
    stock_status: product.stock_status,
    is_featured:  product.is_featured,
    is_active:    product.is_active,
    image_url:    product.image_url || '',
  } : {
    name: '', description: '', category_id: categories[0]?.id || '',
    unit: 'kg', price: '', offer_price: '', offer_label: '',
    stock_status: 'in_stock', is_featured: false, is_active: true, image_url: '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `products/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file)
    if (error) { toast.error('Image upload failed'); setUploading(false); return }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    set('image_url', data.publicUrl)
    setUploading(false)
    toast.success('Image uploaded!')
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Product name is required'); return }
    if (!form.price)        { toast.error('Price is required'); return }
    if (!form.category_id)  { toast.error('Please select a category'); return }
    setSaving(true)
    const payload = {
      ...form,
      price:       Number(form.price),
      offer_price: form.offer_price ? Number(form.offer_price) : null,
      offer_label: form.offer_label || null,
    }
    const res = await fetch('/api/admin-write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'products', action: product ? 'update' : 'create', id: product?.id, payload }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { toast.error(data.error || 'Save failed'); return }
    toast.success(product ? 'Product updated!' : 'Product added!')
    onSaved(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h3 className="font-bold text-gray-900">{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X size={15} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Image */}
          <div>
            <label className={labelCls}>Product Image</label>
            <div className="flex items-center gap-4">
              <img
                src={form.image_url || PLACEHOLDER_IMAGE}
                alt=""
                className="w-20 h-20 rounded-2xl object-cover bg-gray-100 border border-gray-200"
                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
              />
              <div className="flex flex-col gap-2 flex-1">
                <button
                  onClick={() => fileRef.current.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 h-9 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors disabled:opacity-50"
                >
                  <Image size={14} />
                  {uploading ? 'Uploading…' : 'Upload Image'}
                </button>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => set('image_url', e.target.value)}
                  placeholder="Or paste image URL"
                  className="h-9 px-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#166534]"
                />
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className={labelCls}>Product Name *</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Fresh Spinach" className={input} />
          </div>

          {/* Category + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Category *</label>
              <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)}
                className={`${input} bg-white`}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Unit</label>
              <select value={form.unit} onChange={(e) => set('unit', e.target.value)}
                className={`${input} bg-white`}>
                {['kg', '500g', '250g', '100g', 'bunch', 'piece', 'dozen', '200g', '125g', 'litre', 'pack'].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price + Offer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Price (₹) *</label>
              <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)}
                placeholder="0" className={input} />
            </div>
            <div>
              <label className={labelCls}>Offer Price (₹)</label>
              <input type="number" value={form.offer_price} onChange={(e) => set('offer_price', e.target.value)}
                placeholder="Optional" className={input} />
            </div>
          </div>

          {/* Offer preview */}
          {form.offer_price && Number(form.offer_price) < Number(form.price) && (
            <div className="rounded-xl p-3 text-center" style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--brand-700)' }}>
                {Math.round(((form.price - form.offer_price) / form.price) * 100)}% discount
              </span>
              <span className="text-xs ml-2" style={{ color: 'var(--brand-600)' }}>
                — Customer saves {formatPrice(form.price - form.offer_price)}
              </span>
            </div>
          )}

          {/* Offer label */}
          <div>
            <label className={labelCls}>Offer Label</label>
            <input value={form.offer_label} onChange={(e) => set('offer_label', e.target.value)}
              placeholder="e.g. 20% OFF, Deal of the Day" className={input} />
          </div>

          {/* Stock status */}
          <div>
            <label className={labelCls}>Stock Status</label>
            <div className="flex gap-2">
              {STOCK_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => set('stock_status', value)}
                  className={`flex-1 h-10 rounded-xl text-xs font-semibold border transition-colors
                    ${form.stock_status === value
                      ? 'bg-[#166534] text-white border-[#166534]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              rows={3} placeholder="Product description..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#166634] resize-none" />
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            {[
              { key: 'is_featured', label: 'Featured on Home' },
              { key: 'is_active',   label: 'Visible in Store' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="accent-[#166534] w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 h-12 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 h-12 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-opacity"
              style={{ background: 'var(--brand-600)' }}>
              {saving ? 'Saving…' : product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [search, setSearch]               = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showModal, setShowModal]         = useState(false)
  const [editProduct, setEditProduct]     = useState(null)
  const [allProducts, setAllProducts]     = useState([])
  const [allLoading, setAllLoading]       = useState(true)

  // ✅ Real Supabase categories (not mock data)
  const categories = useRealCategories()

  useEffect(() => {
    fetchProducts()
  }, [search, selectedCategory])

  const fetchProducts = async () => {
    setAllLoading(true)
    let q = supabase
      .from('products')
      .select('*, categories(name, emoji)')
      .order('created_at', { ascending: false })
    if (search)           q = q.ilike('name', `%${search}%`)
    if (selectedCategory) q = q.eq('category_id', selectedCategory)
    const { data, error } = await q
    if (error) toast.error('Failed to load products: ' + error.message)
    setAllProducts(data || [])
    setAllLoading(false)
  }

  const adminWrite = async (action, id, payload) => {
    const res = await fetch('/api/admin-write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'products', action, id, payload }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
  }

  const handleToggleActive = async (product) => {
    try {
      await adminWrite('update', product.id, { is_active: !product.is_active })
      setAllProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p))
      toast.success(product.is_active ? 'Product hidden' : 'Product visible')
    } catch (e) { toast.error(e.message) }
  }

  const handleStockChange = async (product, newStatus) => {
    try {
      await adminWrite('update', product.id, { stock_status: newStatus })
      setAllProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock_status: newStatus } : p))
      toast.success('Stock updated')
    } catch (e) { toast.error(e.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    try {
      await adminWrite('delete', id)
      setAllProducts(prev => prev.filter(p => p.id !== id))
      toast.success('Product deleted')
    } catch (e) { toast.error(e.message) }
  }

  const handlePriceChange = async (product, newPrice) => {
    const price = Number(newPrice)
    if (!price || price === product.price) return
    try {
      await adminWrite('update', product.id, { price })
      setAllProducts(prev => prev.map(p => p.id === product.id ? { ...p, price } : p))
      toast.success('Price updated')
    } catch (e) { toast.error(e.message) }
  }

  const stockColors = {
    in_stock:    { bg: '#dcfce7', color: '#15803d' },
    limited:     { bg: '#fef3c7', color: '#b45309' },
    out_of_stock:{ bg: '#fee2e2', color: '#b91c1c' },
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Products
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{allProducts.length} total</p>
        </div>
        <button
          onClick={() => { setEditProduct(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'var(--brand-600)' }}
        >
          <Plus size={15} strokeWidth={2.5} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div
          className="flex-1 flex items-center gap-2 border rounded-xl px-3 h-10 transition-colors focus-within:border-[#166534]"
          style={{ background: '#fff', borderColor: 'var(--border)' }}
        >
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="flex-1 text-sm outline-none bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={13} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-10 px-3 border border-gray-200 rounded-xl text-sm outline-none bg-white max-w-[180px] focus:border-[#166534]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {allLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : allProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--gray-100)' }}>
            <ShoppingBag size={28} style={{ color: 'var(--text-light)' }} />
          </div>
          <p className="text-sm font-medium text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--border-light)' }}>
                <tr>
                  {['Product', 'Category', 'Price', 'Offer', 'Stock', 'Visible', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allProducts.map((product, idx) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-gray-50/70"
                    style={{
                      borderTop: idx > 0 ? '1px solid var(--border-light)' : 'none',
                      opacity: product.is_active ? 1 : 0.45,
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url || PLACEHOLDER_IMAGE}
                          alt=""
                          className="w-11 h-11 rounded-xl object-cover bg-gray-100 shrink-0"
                          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
                        />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm leading-tight">{product.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{product.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {product.categories?.emoji} {product.categories?.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        defaultValue={product.price}
                        onBlur={(e) => handlePriceChange(product, e.target.value)}
                        className="w-20 h-8 px-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#166534] text-center"
                      />
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: product.offer_price ? 'var(--red-600)' : 'var(--text-light)' }}>
                      {product.offer_price ? formatPrice(product.offer_price) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={product.stock_status}
                        onChange={(e) => handleStockChange(product, e.target.value)}
                        className="text-xs rounded-lg px-2 py-1 outline-none font-semibold border-0 cursor-pointer"
                        style={stockColors[product.stock_status] || {}}
                      >
                        {STOCK_OPTIONS.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActive(product)} className="transition-transform active:scale-90">
                        {product.is_active
                          ? <ToggleRight size={26} style={{ color: 'var(--brand-600)' }} />
                          : <ToggleLeft size={26} className="text-gray-300" />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditProduct(product); setShowModal(true) }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-100"
                          style={{ background: '#eff6ff' }}
                        >
                          <Edit2 size={13} style={{ color: '#3b82f6' }} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-100"
                          style={{ background: 'var(--red-50)' }}
                        >
                          <Trash2 size={13} style={{ color: 'var(--red-500)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <ProductModal
          product={editProduct}
          categories={categories}
          onClose={() => { setShowModal(false); setEditProduct(null) }}
          onSaved={(p) => {
            setAllProducts(prev =>
              editProduct ? prev.map(x => x.id === p.id ? { ...p, categories: x.categories } : x) : [p, ...prev]
            )
          }}
        />
      )}
    </div>
  )
}
