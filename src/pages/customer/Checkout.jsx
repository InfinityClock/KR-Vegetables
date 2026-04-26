import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Navigation, Search, CreditCard, Banknote,
  CheckCircle, Loader2, AlertCircle,
} from 'lucide-react'
import { useCartStore, useCartSubtotal, useCartDeliveryFee, useCartTotal } from '../../store/cartStore'
import { formatPrice } from '../../utils/format'
import { PageTopBar } from '../../components/TopBar'
import { supabase } from '../../lib/supabase'
import { openRazorpayCheckout } from '../../lib/razorpay'
import toast from 'react-hot-toast'

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// ─── Load Google Maps API ──────────────────────────────────────────────────────
function loadMapsApi() {
  return new Promise((resolve) => {
    if (window.google?.maps?.places) { resolve(); return }
    const existing = document.getElementById('gm-api')
    if (existing) { existing.addEventListener('load', resolve); return }
    const script = document.createElement('script')
    script.id = 'gm-api'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.addEventListener('load', resolve)
    document.head.appendChild(script)
  })
}

// Parse Google Maps address_components into form fields
function parseComponents(components = []) {
  const get = (type) =>
    components.find((c) => c.types.includes(type))?.long_name || ''
  const streetNum  = get('street_number')
  const route      = get('route')
  const sublocality = get('sublocality_level_1') || get('sublocality') || get('neighborhood')
  const city       = get('locality') || get('administrative_area_level_2')
  const pincode    = get('postal_code')

  return {
    line1: [streetNum, route].filter(Boolean).join(', ') || sublocality,
    line2: sublocality && route ? sublocality : '',
    city,
    pincode,
  }
}

// ─── Radio card ───────────────────────────────────────────────────────────────
function RadioCard({ selected, onClick, icon: Icon, label, subtitle }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 cursor-pointer transition-all active:scale-98"
      style={{
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        border: `1.5px solid ${selected ? 'var(--brand-800)' : 'var(--border)'}`,
        background: selected ? 'var(--brand-50)' : 'var(--bg-card)',
      }}
    >
      <div
        style={{
          width: 36, height: 36,
          borderRadius: 'var(--radius-sm)',
          background: selected ? 'var(--brand-100)' : 'var(--bg-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} style={{ color: selected ? 'var(--brand-700)' : 'var(--text-muted)' }} />
      </div>
      <div className="flex-1">
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>
          {label}
        </p>
        {subtitle && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>
      <div
        style={{
          width: 18, height: 18, borderRadius: '50%',
          border: `2px solid ${selected ? 'var(--brand-800)' : 'var(--border)'}`,
          background: selected ? 'var(--brand-800)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {selected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
      </div>
    </div>
  )
}

// ─── Input field ──────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label style={{
        display: 'block', fontFamily: 'var(--font-body)', fontSize: '10px',
        fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: 'var(--text-muted)', marginBottom: 6,
      }}>
        {label}{required && <span style={{ color: 'var(--red-600)' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', height: 44,
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--bg-card)',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--text-dark)',
  padding: '0 12px',
  outline: 'none',
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ step, title, children }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 22, height: 22, borderRadius: '50%',
          background: 'var(--brand-800)', color: '#fff',
          fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {step}
        </span>
        <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)' }}>
          {title}
        </h3>
      </div>
      <div style={{ padding: 16 }}>
        {children}
      </div>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items, deliverySlot, notes, clearCart } = useCartStore()
  const subtotal    = useCartSubtotal()
  const deliveryFee = useCartDeliveryFee()
  const total       = useCartTotal()

  // Show payment cancelled toast if redirected back with ?payment=cancelled
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('payment') === 'cancelled') {
      toast.error('Payment was cancelled. Try again.')
    }
  }, [])

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0) navigate('/cart')
  }, [items.length])

  // ── Customer details ─────────────────────────────────────────────────────
  const [name, setName]   = useState('')
  const [phone, setPhone] = useState('')

  // ── Location ─────────────────────────────────────────────────────────────
  const searchRef    = useRef(null)
  const autocomplRef = useRef(null)
  const [mapsReady,  setMapsReady]  = useState(false)
  const [detecting,  setDetecting]  = useState(false)
  const [mapCoords,  setMapCoords]  = useState(null) // { lat, lng }
  const [addr, setAddr] = useState({ line1: '', line2: '', city: '', pincode: '', label: 'Home' })

  // Load Google Maps API
  useEffect(() => {
    if (!MAPS_KEY) return
    loadMapsApi().then(() => setMapsReady(true))
  }, [])

  // Initialize Places Autocomplete
  useEffect(() => {
    if (!mapsReady || !searchRef.current || autocomplRef.current) return
    const ac = new window.google.maps.places.Autocomplete(searchRef.current, {
      componentRestrictions: { country: 'in' },
      fields: ['formatted_address', 'geometry', 'address_components'],
    })
    autocomplRef.current = ac
    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      if (!place.geometry) return
      const { lat, lng } = place.geometry.location
      const coords = { lat: lat(), lng: lng() }
      setMapCoords(coords)
      const parsed = parseComponents(place.address_components)
      setAddr((a) => ({ ...a, ...parsed }))
      if (searchRef.current) searchRef.current.value = place.formatted_address
    })
  }, [mapsReady])

  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return }
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setMapCoords({ lat, lng })
        if (MAPS_KEY) {
          try {
            const res  = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAPS_KEY}`
            )
            const data = await res.json()
            if (data.results[0]) {
              const parsed = parseComponents(data.results[0].address_components)
              setAddr((a) => ({ ...a, ...parsed }))
              if (searchRef.current) searchRef.current.value = data.results[0].formatted_address
            }
          } catch { /* silent — user can fill manually */ }
        }
        setDetecting(false)
        toast.success('Location detected!')
      },
      () => {
        toast.error('Could not detect location. Please enter address manually.')
        setDetecting(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // ── Payment ───────────────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [placing, setPlacing] = useState(false)

  const handlePlaceOrder = async () => {
    // Validate
    if (!name.trim()) { toast.error('Please enter your name'); return }
    if (!/^\d{10}$/.test(phone)) { toast.error('Please enter a valid 10-digit phone number'); return }
    if (!addr.line1.trim()) { toast.error('Please enter your delivery address'); return }
    if (!addr.city.trim()) { toast.error('Please enter your city'); return }
    if (!/^\d{6}$/.test(addr.pincode)) { toast.error('Please enter a valid 6-digit pincode'); return }
    if (items.length === 0) { toast.error('Cart is empty'); return }

    setPlacing(true)

    try {
      // 1. Create order record in DB
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: { ...addr, lat: mapCoords?.lat, lng: mapCoords?.lng },
          items,
          subtotal,
          deliveryFee,
          total,
          deliverySlot,
          notes,
          paymentMethod,
        }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      const { orderId, orderNumber, order } = orderData

      if (paymentMethod === 'cod') {
        clearCart()
        navigate(`/order-success/${orderId}`, { state: { order, name } })
        return
      }

      // 2. Create Razorpay order via Supabase Edge Function
      const { data: rzpOrder, error: rzpErr } = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount: total },
      })
      if (rzpErr || !rzpOrder?.id) {
        throw new Error(rzpErr?.message || 'Could not initiate payment. Please try again.')
      }

      // 3. Open Razorpay checkout modal — callbacks handle the rest
      openRazorpayCheckout({
        orderId: rzpOrder.id,
        amount: total,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        description: `Order ${orderNumber}`,
        onSuccess: async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
          try {
            // 4. Verify signature server-side and mark order as paid
            const { error: vErr } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id: orderId },
            })
            if (vErr) throw new Error(`Payment verification failed. Quote order ${orderNumber} when contacting support.`)
            clearCart()
            navigate(`/order-success/${orderId}`, { state: { order, name } })
          } catch (e) {
            toast.error(e.message)
            setPlacing(false)
          }
        },
        onFailure: (msg) => {
          if (msg && msg !== 'Payment cancelled') toast.error(msg)
          else toast('Payment cancelled.', { icon: 'ℹ️' })
          setPlacing(false)
        },
      })
      // placing stays true while modal is open; callbacks reset it on failure/cancel

    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.')
      setPlacing(false)
    }
  }

  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  const mapSrc = mapCoords && MAPS_KEY
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${mapCoords.lat},${mapCoords.lng}&zoom=16&size=600x200&scale=2&markers=color:0x1b3e2c%7C${mapCoords.lat},${mapCoords.lng}&key=${MAPS_KEY}`
    : null

  return (
    <div className="pb-nav page-enter" style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>
      <PageTopBar title="Checkout" />

      <div className="flex flex-col gap-3 p-4 lg:max-w-lg lg:mx-auto lg:py-8">

        {/* ── 1. Your Details ── */}
        <Section step="1" title="Your Details">
          <div className="flex flex-col gap-3">
            <Field label="Full Name" required>
              <input
                style={inputStyle}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
              />
            </Field>
            <Field label="Phone Number" required>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)',
                }}>
                  +91
                </span>
                <input
                  style={{ ...inputStyle, paddingLeft: 40 }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  type="tel"
                  inputMode="numeric"
                />
              </div>
            </Field>
          </div>
        </Section>

        {/* ── 2. Delivery Location ── */}
        <Section step="2" title="Delivery Address">
          <div className="flex flex-col gap-3">

            {/* GPS Detect button */}
            <button
              onClick={detectLocation}
              disabled={detecting}
              className="flex items-center gap-2.5 transition-all active:scale-97"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--brand-800)',
                background: 'var(--brand-50)',
                cursor: detecting ? 'wait' : 'pointer',
              }}
            >
              {detecting
                ? <Loader2 size={16} style={{ color: 'var(--brand-800)', animation: 'spin 1s linear infinite' }} />
                : <Navigation size={16} style={{ color: 'var(--brand-800)' }} />
              }
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--brand-800)' }}>
                {detecting ? 'Detecting your location…' : 'Use my current location'}
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-light)' }}>or search</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* Google Maps autocomplete search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)',
              }} />
              <input
                ref={searchRef}
                style={{ ...inputStyle, paddingLeft: 36 }}
                placeholder={mapsReady ? 'Search your address…' : MAPS_KEY ? 'Loading Maps…' : 'Enter address below'}
                disabled={!mapsReady && !!MAPS_KEY}
              />
            </div>

            {/* Map preview */}
            {mapSrc && (
              <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={mapSrc} alt="Delivery location" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={13} style={{ color: 'var(--brand-700)' }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--brand-700)', fontWeight: 600 }}>
                    Location pinned
                  </span>
                </div>
              </div>
            )}

            {!MAPS_KEY && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: 'var(--amber-50)', border: '1px solid var(--amber-100)', borderRadius: 'var(--radius-sm)' }}>
                <AlertCircle size={14} style={{ color: 'var(--amber-700)', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--amber-800)' }}>
                  Add <strong>VITE_GOOGLE_MAPS_API_KEY</strong> in Vercel env vars to enable location search &amp; GPS.
                </p>
              </div>
            )}

            {/* Address label */}
            <div className="flex gap-2">
              {['Home', 'Office', 'Other'].map((l) => (
                <button
                  key={l}
                  onClick={() => setAddr((a) => ({ ...a, label: l }))}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${addr.label === l ? 'var(--brand-800)' : 'var(--border)'}`,
                    background: addr.label === l ? 'var(--brand-800)' : 'var(--bg-card)',
                    color: addr.label === l ? '#fff' : 'var(--text-muted)',
                    fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Address fields */}
            <Field label="House / Flat / Street" required>
              <input
                style={inputStyle}
                value={addr.line1}
                onChange={(e) => setAddr((a) => ({ ...a, line1: e.target.value }))}
                placeholder="e.g. 12, Rose Street"
              />
            </Field>
            <Field label="Area / Landmark">
              <input
                style={inputStyle}
                value={addr.line2}
                onChange={(e) => setAddr((a) => ({ ...a, line2: e.target.value }))}
                placeholder="Landmark or area (optional)"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" required>
                <input
                  style={inputStyle}
                  value={addr.city}
                  onChange={(e) => setAddr((a) => ({ ...a, city: e.target.value }))}
                  placeholder="City"
                />
              </Field>
              <Field label="Pincode" required>
                <input
                  style={inputStyle}
                  value={addr.pincode}
                  onChange={(e) => setAddr((a) => ({ ...a, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  placeholder="6-digit pincode"
                  type="tel"
                  inputMode="numeric"
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* ── 3. Order Summary ── */}
        <Section step="3" title={`Order Summary — ${itemCount} item${itemCount !== 1 ? 's' : ''}`}>
          <div className="flex flex-col gap-1.5">
            {items.map((item) => {
              const price = item.offer_price || item.price
              return (
                <div key={item.id} className="flex justify-between items-center">
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-mid)' }}>
                    {item.name} <span style={{ color: 'var(--text-light)' }}>× {item.quantity}</span>
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>
                    {formatPrice(price * item.quantity)}
                  </span>
                </div>
              )
            })}
            <div style={{ height: 1, background: 'var(--border-light)', margin: '6px 0' }} />
            <div className="flex justify-between">
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>Delivery Slot</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)' }}>{deliverySlot}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>Delivery Fee</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: deliveryFee === 0 ? 'var(--brand-600)' : 'var(--text-dark)' }}>
                {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
              </span>
            </div>
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <div className="flex justify-between">
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-dark)' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--brand-800)' }}>{formatPrice(total)}</span>
            </div>
          </div>
        </Section>

        {/* ── 4. Payment Method ── */}
        <Section step="4" title="Payment Method">
          <div className="flex flex-col gap-2">
            <RadioCard
              selected={paymentMethod === 'razorpay'}
              onClick={() => setPaymentMethod('razorpay')}
              icon={CreditCard}
              label="Pay Online"
              subtitle="UPI, Cards, Netbanking via Razorpay"
            />
            <RadioCard
              selected={paymentMethod === 'cod'}
              onClick={() => setPaymentMethod('cod')}
              icon={Banknote}
              label="Cash on Delivery"
              subtitle="Pay when your order arrives"
            />
          </div>
        </Section>

        {/* ── Place Order CTA ── */}
        <button
          onClick={handlePlaceOrder}
          disabled={placing}
          className="btn-ripple transition-all"
          style={{
            width: '100%',
            height: 52,
            borderRadius: 'var(--radius-sm)',
            background: placing ? 'var(--warm-300)' : 'var(--brand-800)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 700,
            border: 'none',
            cursor: placing ? 'wait' : 'pointer',
            letterSpacing: '.02em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {placing
            ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Placing Order…</>
            : `${paymentMethod === 'cod' ? 'Place Order' : 'Pay via Razorpay'} — ${formatPrice(total)}`
          }
        </button>

        <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-light)' }}>
          By placing this order you agree to our terms of service.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
