import { useState, useRef, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Image, ToggleLeft, ToggleRight, Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useProducts, useCategories } from '../../hooks/useProducts'
import { formatPrice } from '../../utils/format'
import { STOCK_STATUS, PLACEHOLDER_IMAGE } from '../../constants'
import { SkeletonProductGrid } from '../../components/Skeleton'
import toast from 'react-hot-toast'

const STOCK_OPTIONS = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'limited', label: 'Limited' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

function ProductModal({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState(product ? {
    name: product.name, description: product.description || '',
    category_id: product.category_id, unit: product.unit,
    price: product.price, offer_price: product.offer_price || '',
    offer_label: product.offer_label || '', stock_status: product.stock_status,
    is_featured: product.is_featured, is_active: product.is_active,
    image_url: product.image_url || '',
  } : {
    name: '', description: '', category_id: categories[0]?.id || '',
    unit: 'kg', price: '', offer_price: '', offer_label: '',
    stock_status: 'in_stock', is_featured: false, is_active: true, image_url: '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `products/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file)
    if (error) { toast.error('Image upload failed'); setUploading(false); return }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    setForm((f) => ({ ...f, image_url: data.publicUrl }))
    setUploading(false)
    toast.success('Image uploaded!')
  }

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return }
    setSaving(true)
    const payload = {
      ...form,
      price: Number(form.price),
      offer_price: form.offer_price ? Number(form.offer_price) : null,
      offer_label: form.offer_label || null,
    }
    const { data, error } = product
      ? await supabase.from('products').update(payload).eq('id', product.id).select().single()
      : await supabase.from('products').insert(payload).select().single()
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(product ? 'Product updated!' : 'Product created!')
    onSaved(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h3 className="font-bold text-gray-900">{product ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Image */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Product Image</label>
            <div className="flex items-center gap-3">
              <img
                src={form.image_url || PLACEHOLDER_IMAGE}
                alt=""
                className="w-20 h-20 rounded-xl object-cover bg-gray-100"
                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => fileRef.current.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700"
                >
                  <Image size={14} />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="Or paste image URL"
                  className="px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#2D6A4F]"
                />
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Product Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Fresh Spinach"
              className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F]" />
          </div>

          {/* Category + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Category</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F] bg-white">
                {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F] bg-white">
                {['kg', '500g', '250g', '100g', 'bunch', 'piece', 'dozen', '200g', '125g'].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price + Offer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Price (₹) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0"
                className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Offer Price (₹)</label>
              <input type="number" value={form.offer_price} onChange={(e) => setForm({ ...form, offer_price: e.target.value })}
                placeholder="Optional"
                className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F]" />
            </div>
          </div>

          {/* Offer label */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Offer Label</label>
            <input value={form.offer_label} onChange={(e) => setForm({ ...form, offer_label: e.target.value })}
              placeholder="e.g. 20% OFF, Deal of the Day"
              className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F]" />
          </div>

          {/* Stock status */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Stock Status</label>
            <div className="flex gap-2">
              {STOCK_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setForm({ ...form, stock_status: value })}
                  className={`flex-1 h-10 rounded-xl text-xs font-semibold border transition-colors
                    ${form.stock_status === value ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3} placeholder="Product description..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F] resize-none" />
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-[#2D6A4F]" />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-[#2D6A4F]" />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 h-12 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 h-12 bg-[#2D6A4F] rounded-xl text-sm font-bold text-white disabled:opacity-60">
              {saving ? 'Saving...' : product ? 'Update' : 'Add Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminProducts() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const { products, loading, refetch } = useProducts({ search: search || undefined, category_id: selectedCategory || undefined })
  const { categories } = useCategories()

  // Show all products including inactive in admin
  const [allProducts, setAllProducts] = useState([])
  const [allLoading, setAllLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setAllLoading(true)
      let q = supabase.from('products').select('*, categories(name, emoji)').order('sort_order')
      if (search) q = q.ilike('name', `%${search}%`)
      if (selectedCategory) q = q.eq('category_id', selectedCategory)
      const { data } = await q
      setAllProducts(data || [])
      setAllLoading(false)
    }
    fetchAll()
  }, [search, selectedCategory])

  const handleToggleActive = async (product) => {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    setAllProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, is_active: !p.is_active } : p))
    toast.success(product.is_active ? 'Product hidden from store' : 'Product visible in store')
  }

  const handleStockChange = async (product, newStatus) => {
    await supabase.from('products').update({ stock_status: newStatus }).eq('id', product.id)
    setAllProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, stock_status: newStatus } : p))
    toast.success('Stock status updated')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    setAllProducts((prev) => prev.filter((p) => p.id !== id))
    toast.success('Product deleted')
  }

  const handlePriceChange = async (product, newPrice) => {
    const price = Number(newPrice)
    if (!price) return
    await supabase.from('products').update({ price }).eq('id', product.id)
    setAllProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, price } : p))
    toast.success('Price updated')
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Products</h1>
        <button
          onClick={() => { setEditProduct(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 h-10 bg-[#2D6A4F] text-white rounded-xl text-sm font-semibold"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-10">
          <Search size={16} className="text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
            className="flex-1 text-sm outline-none" />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-10 px-3 border border-gray-200 rounded-xl text-sm outline-none bg-white min-w-0 max-w-[160px]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
        </select>
      </div>

      {allLoading ? (
        <SkeletonProductGrid count={8} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Product', 'Category', 'Price', 'Offer', 'Stock', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allProducts.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50 ${!product.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.image_url || PLACEHOLDER_IMAGE} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }} />
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {product.categories?.emoji} {product.categories?.name}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        defaultValue={product.price}
                        onBlur={(e) => handlePriceChange(product, e.target.value)}
                        className="w-20 h-8 px-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#2D6A4F]"
                      />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {product.offer_price ? (
                        <span className="text-[#E76F51] font-semibold">{formatPrice(product.offer_price)}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={product.stock_status}
                        onChange={(e) => handleStockChange(product, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white outline-none"
                      >
                        {STOCK_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActive(product)}>
                        {product.is_active
                          ? <ToggleRight size={24} className="text-[#2D6A4F]" />
                          : <ToggleLeft size={24} className="text-gray-300" />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditProduct(product); setShowModal(true) }}
                          className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Edit2 size={12} className="text-blue-600" />
                        </button>
                        <button onClick={() => handleDelete(product.id)}
                          className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                          <Trash2 size={12} className="text-red-500" />
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
            setAllProducts((prev) => editProduct
              ? prev.map((x) => x.id === p.id ? p : x)
              : [p, ...prev]
            )
          }}
        />
      )}
    </div>
  )
}
