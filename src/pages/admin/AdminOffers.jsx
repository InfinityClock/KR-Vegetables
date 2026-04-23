import { useState, useEffect } from 'react'
import { Tag, Plus, Trash2, Edit2, X, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../utils/format'
import { PLACEHOLDER_IMAGE } from '../../constants'
import toast from 'react-hot-toast'

function OfferModal({ product, onClose, onSaved }) {
  const [offerPrice, setOfferPrice] = useState(product.offer_price || '')
  const [offerLabel, setOfferLabel] = useState(product.offer_label || '')
  const [expiresAt, setExpiresAt] = useState(
    product.offer_expires_at ? new Date(product.offer_expires_at).toISOString().slice(0, 16) : ''
  )
  const [saving, setSaving] = useState(false)

  const discountPct = offerPrice && Number(offerPrice) < Number(product.price)
    ? Math.round(((product.price - offerPrice) / product.price) * 100)
    : null

  const save = async () => {
    setSaving(true)
    const res = await fetch('/api/admin-write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: 'products', action: 'update', id: product.id,
        payload: {
          offer_price: offerPrice ? Number(offerPrice) : null,
          offer_label: offerLabel || null,
          offer_expires_at: expiresAt || null,
        },
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { toast.error(data.error || 'Save failed'); return }
    toast.success('Offer updated!')
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
          <div>
            <h3 className="font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-display)' }}>
              Set Offer
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--gray-100)', color: 'var(--text-mid)' }}
          >
            <X size={15} />
          </button>
        </div>

        <div
          className="text-center p-4 rounded-2xl"
          style={{ background: 'var(--gray-50)', border: '1px solid var(--border-light)' }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Original Price</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>{formatPrice(product.price)}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>per {product.unit}</p>
        </div>

        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-mid)' }}>
            Offer Price (₹)
          </label>
          <input
            type="number"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            placeholder="Discounted price"
            className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
            style={{ border: '1.5px solid var(--border)', background: 'var(--gray-50)' }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.background = '#fff' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--gray-50)' }}
          />
        </div>

        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-mid)' }}>
            Offer Label
          </label>
          <input
            value={offerLabel}
            onChange={(e) => setOfferLabel(e.target.value)}
            placeholder="e.g. 20% OFF, Deal of the Day"
            className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
            style={{ border: '1.5px solid var(--border)', background: 'var(--gray-50)' }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.background = '#fff' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--gray-50)' }}
          />
        </div>

        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-mid)' }}>
            Expires At (optional)
          </label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
            style={{ border: '1.5px solid var(--border)', background: 'var(--gray-50)' }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.background = '#fff' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--gray-50)' }}
          />
        </div>

        {discountPct && (
          <div className="rounded-xl p-3 text-center" style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}>
            <p className="text-sm font-bold" style={{ color: 'var(--brand-700)' }}>
              <Zap size={14} className="inline mr-1" />
              {discountPct}% discount — customer saves {formatPrice(product.price - offerPrice)}
            </p>
          </div>
        )}

        <div className="flex gap-3">
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
            {saving ? 'Saving…' : 'Set Offer'}
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
    const res = await fetch('/api/admin-write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'products', action: 'update', id: productId, payload: { offer_price: null, offer_label: null, offer_expires_at: null } }),
    })
    if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Failed'); return }
    setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, offer_price: null, offer_label: null } : p))
    toast.success('Offer removed')
  }

  const withOffers = products.filter((p) => p.offer_price)
  const withoutOffers = products.filter((p) => !p.offer_price)

  const TABS = [
    { value: 'active', label: `Active (${withOffers.length})` },
    { value: 'add', label: 'Add Offer' },
    { value: 'banners', label: 'Banners' },
  ]

  return (
    <div className="p-4 lg:p-6 max-w-3xl">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dark)' }}
        >
          Offers & Promotions
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Manage product discounts and promotional banners
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className="px-4 h-9 rounded-xl text-sm font-semibold transition-all"
            style={
              tab === value
                ? { background: 'var(--brand-700)', color: '#fff', border: '1.5px solid var(--brand-700)' }
                : { background: '#fff', color: 'var(--text-mid)', border: '1.5px solid var(--border)' }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Active Offers */}
      {tab === 'active' && (
        <div className="space-y-3">
          {withOffers.length === 0 ? (
            <div
              className="rounded-2xl py-16 flex flex-col items-center gap-3"
              style={{ background: '#fff', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}
            >
              <Tag size={36} style={{ opacity: 0.3 }} />
              <p className="text-sm">No active offers</p>
              <button
                onClick={() => setTab('add')}
                className="text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', border: '1px solid var(--brand-100)' }}
              >
                + Add first offer
              </button>
            </div>
          ) : withOffers.map((product) => {
            const discountPct = Math.round(((product.price - product.offer_price) / product.price) * 100)
            return (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 rounded-2xl transition-colors"
                style={{ background: '#fff', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
              >
                <img
                  src={product.image_url || PLACEHOLDER_IMAGE}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                  style={{ background: 'var(--gray-100)' }}
                  onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--text-dark)' }}>{product.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{product.categories?.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-sm font-bold" style={{ color: 'var(--brand-700)' }}>
                      {formatPrice(product.offer_price)}
                    </span>
                    <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                      {formatPrice(product.price)}
                    </span>
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: '#FEF3C7', color: '#D97706' }}
                    >
                      -{discountPct}%
                    </span>
                    {product.offer_label && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}
                      >
                        {product.offer_label}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: '#EFF6FF' }}
                  >
                    <Edit2 size={13} style={{ color: '#3B82F6' }} />
                  </button>
                  <button
                    onClick={() => removeOffer(product.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
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

      {/* Add Offer */}
      {tab === 'add' && (
        <div>
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            Select a product to add a discount offer:
          </p>
          <div className="space-y-2">
            {withoutOffers.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                style={{ background: '#fff', border: '1.5px solid var(--border-light)' }}
                onClick={() => setSelectedProduct(product)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand-300)'
                  e.currentTarget.style.background = 'var(--brand-50)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)'
                  e.currentTarget.style.background = '#fff'
                }}
              >
                <img
                  src={product.image_url || PLACEHOLDER_IMAGE}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                  style={{ background: 'var(--gray-100)' }}
                  onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-dark)' }}>{product.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatPrice(product.price)} / {product.unit}
                  </p>
                </div>
                <Plus size={16} style={{ color: 'var(--brand-600)', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banners */}
      {tab === 'banners' && (
        <div className="space-y-3">
          {banners.length === 0 ? (
            <div
              className="rounded-2xl p-5 text-center text-sm"
              style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              No banners configured
            </div>
          ) : banners.map((banner) => (
            <div
              key={banner.id}
              className="rounded-2xl p-5 text-white relative overflow-hidden"
              style={{ background: banner.bg_color }}
            >
              <h3 className="font-bold text-lg">{banner.title}</h3>
              <p className="text-white/80 text-sm mt-0.5">{banner.subtitle}</p>
            </div>
          ))}
          <div
            className="rounded-xl p-4 text-sm"
            style={{ background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E' }}
          >
            <p className="font-semibold mb-0.5">💡 Tip</p>
            <p className="text-xs">Manage banner content directly in the Supabase dashboard under the <code>offers_banner</code> table.</p>
          </div>
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
