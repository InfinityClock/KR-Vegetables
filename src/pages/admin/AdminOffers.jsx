import { useState, useEffect } from 'react'
import { Tag, Plus, Trash2, Edit2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../utils/format'
import { PLACEHOLDER_IMAGE } from '../../constants'
import toast from 'react-hot-toast'

function OfferModal({ product, onClose, onSaved }) {
  const [offerPrice, setOfferPrice] = useState(product.offer_price || '')
  const [offerLabel, setOfferLabel] = useState(product.offer_label || '')
  const [expiresAt, setExpiresAt] = useState(product.offer_expires_at ? new Date(product.offer_expires_at).toISOString().slice(0, 16) : '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const { data, error } = await supabase
      .from('products')
      .update({
        offer_price: offerPrice ? Number(offerPrice) : null,
        offer_label: offerLabel || null,
        offer_expires_at: expiresAt || null,
      })
      .eq('id', product.id)
      .select()
      .single()
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Offer updated!')
    onSaved(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Set Offer — {product.name}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">✕</button>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-500">Original Price</p>
          <p className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Offer Price (₹)</label>
          <input type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)}
            placeholder="Discounted price"
            className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F]" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Offer Label</label>
          <input value={offerLabel} onChange={(e) => setOfferLabel(e.target.value)}
            placeholder="e.g. 20% OFF, Deal of the Day"
            className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F]" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Expires At (optional)</label>
          <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F]" />
        </div>

        {offerPrice && Number(offerPrice) < Number(product.price) && (
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-sm font-semibold text-green-700">
              {Math.round(((product.price - offerPrice) / product.price) * 100)}% discount!
            </p>
            <p className="text-xs text-green-600">Customer saves {formatPrice(product.price - offerPrice)}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-12 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">Cancel</button>
          <button onClick={save} disabled={saving} className="flex-1 h-12 bg-[#2D6A4F] rounded-xl text-sm font-bold text-white disabled:opacity-60">
            {saving ? 'Saving...' : 'Set Offer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminOffers() {
  const [products, setProducts] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [tab, setTab] = useState('active')

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('*, categories(name, emoji)').not('offer_price', 'is', null).order('name'),
      supabase.from('products').select('*, categories(name, emoji)').is('offer_price', null).order('name').limit(50),
      supabase.from('offers_banner').select('*').order('created_at', { ascending: false }),
    ]).then(([offerRes, allRes, bannerRes]) => {
      setProducts([...(offerRes.data || []), ...(allRes.data || [])])
      setBanners(bannerRes.data || [])
      setLoading(false)
    })
  }, [])

  const removeOffer = async (productId) => {
    await supabase.from('products').update({ offer_price: null, offer_label: null, offer_expires_at: null }).eq('id', productId)
    setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, offer_price: null, offer_label: null } : p))
    toast.success('Offer removed')
  }

  const withOffers = products.filter((p) => p.offer_price)
  const withoutOffers = products.filter((p) => !p.offer_price)

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Offers & Promotions</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[{ value: 'active', label: `Active Offers (${withOffers.length})` }, { value: 'add', label: 'Add Offer' }, { value: 'banners', label: 'Banners' }].map(({ value, label }) => (
          <button key={value} onClick={() => setTab(value)}
            className={`px-4 h-9 rounded-xl text-sm font-semibold border transition-colors
              ${tab === value ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]' : 'bg-white text-gray-600 border-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'active' && (
        <div className="space-y-3">
          {withOffers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Tag size={32} className="mx-auto mb-2 opacity-40" />
              <p>No active offers</p>
            </div>
          ) : (
            withOffers.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                <img src={product.image_url || PLACEHOLDER_IMAGE} alt="" className="w-14 h-14 rounded-xl object-cover bg-gray-100" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.categories?.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-[#2D6A4F]">{formatPrice(product.offer_price)}</span>
                    <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
                    {product.offer_label && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">{product.offer_label}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedProduct(product)} className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Edit2 size={14} className="text-blue-600" />
                  </button>
                  <button onClick={() => removeOffer(product.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'add' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-3">Select a product to add an offer:</p>
          {withoutOffers.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 cursor-pointer hover:border-[#2D6A4F] transition-colors"
              onClick={() => setSelectedProduct(product)}>
              <img src={product.image_url || PLACEHOLDER_IMAGE} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">{formatPrice(product.price)} / {product.unit}</p>
              </div>
              <Tag size={16} className="text-[#2D6A4F]" />
            </div>
          ))}
        </div>
      )}

      {tab === 'banners' && (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div key={banner.id} className="rounded-2xl p-4 text-white relative overflow-hidden" style={{ background: banner.bg_color }}>
              <h3 className="font-bold text-lg">{banner.title}</h3>
              <p className="text-white/80 text-sm">{banner.subtitle}</p>
            </div>
          ))}
          <p className="text-xs text-gray-400 text-center pt-2">Edit banners via Supabase dashboard</p>
        </div>
      )}

      {selectedProduct && (
        <OfferModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSaved={(p) => setProducts((prev) => prev.map((x) => x.id === p.id ? p : x))}
        />
      )}
    </div>
  )
}
