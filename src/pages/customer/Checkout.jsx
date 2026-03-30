import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MapPin, CreditCard, Banknote, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useCartStore, useCartSubtotal, useCartDeliveryFee, useCartTotal } from '../../store/cartStore'
import { formatPrice } from '../../utils/format'
import { generateOrderNumber } from '../../utils/format'
import { openRazorpayCheckout } from '../../lib/razorpay'
import { PageTopBar } from '../../components/TopBar'
import { SkeletonList } from '../../components/Skeleton'
import toast from 'react-hot-toast'

function AddressCard({ address, selected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className="flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all"
      style={{ borderColor: selected ? '#2D6A4F' : '#E5E7EB', background: selected ? '#2D6A4F08' : 'white' }}
    >
      <MapPin size={18} className="text-[#2D6A4F] flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-bold text-gray-900">{address.label}</span>
          {address.is_default && (
            <span className="text-xs bg-[#2D6A4F]/10 text-[#2D6A4F] px-1.5 py-0.5 rounded-full font-medium">Default</span>
          )}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          {address.address_line1}
          {address.address_line2 && `, ${address.address_line2}`}
          <br />
          {address.city} — {address.pincode}
        </p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'border-[#2D6A4F] bg-[#2D6A4F]' : 'border-gray-300'}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </div>
  )
}

function AddAddressModal({ onSave, onClose }) {
  const [form, setForm] = useState({ label: 'Home', address_line1: '', address_line2: '', city: '', pincode: '' })
  const [saving, setSaving] = useState(false)
  const { user } = useAuthStore()

  const save = async () => {
    if (!form.address_line1 || !form.city || !form.pincode) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...form, customer_id: user.id })
      .select()
      .single()
    setSaving(false)
    if (error) { toast.error('Failed to save address'); return }
    onSave(data)
    onClose()
    toast.success('Address saved!')
  }

  const fields = [
    { key: 'address_line1', label: 'Address Line 1 *', placeholder: 'House/Flat no., Building, Street' },
    { key: 'address_line2', label: 'Address Line 2', placeholder: 'Area, Landmark (optional)' },
    { key: 'city', label: 'City *', placeholder: 'City' },
    { key: 'pincode', label: 'Pincode *', placeholder: '6-digit pincode', type: 'tel' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">Add New Address</h3>

        {/* Label selector */}
        <div className="flex gap-2">
          {['Home', 'Office', 'Other'].map((l) => (
            <button
              key={l}
              onClick={() => setForm({ ...form, label: l })}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.label === l ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              {l}
            </button>
          ))}
        </div>

        {fields.map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>
            <input
              type={type || 'text'}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F]"
            />
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 h-12 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 h-12 bg-[#2D6A4F] rounded-xl text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Address'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Checkout() {
  const navigate = useNavigate()
  const { user, customer } = useAuthStore()
  const { items, deliverySlot, notes, clearCart } = useCartStore()
  const subtotal = useCartSubtotal()
  const deliveryFee = useCartDeliveryFee()
  const total = useCartTotal()

  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) navigate('/auth?redirect=/checkout')
  }, [user])

  useEffect(() => {
    if (!user) return
    supabase
      .from('addresses')
      .select('*')
      .eq('customer_id', user.id)
      .order('is_default', { ascending: false })
      .then(({ data }) => {
        setAddresses(data || [])
        if (data?.length) setSelectedAddress(data[0])
        setLoading(false)
      })
  }, [user])

  const createOrderInDB = async (paymentStatus, razorpayData = {}) => {
    const orderNumber = generateOrderNumber()

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: user.id,
        address_id: selectedAddress.id,
        status: 'placed',
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        razorpay_order_id: razorpayData.razorpay_order_id || null,
        razorpay_payment_id: razorpayData.razorpay_payment_id || null,
        subtotal,
        delivery_fee: deliveryFee,
        discount: 0,
        total_amount: total,
        delivery_slot: deliverySlot,
        notes: notes || null,
        placed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Insert order items
    // product_id is set to null because products are served from local mockData
    // (not from the Supabase products table), so there is no valid UUID to reference.
    // All item details (name, unit, price) are stored directly on the order_item row.
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: null,
      product_name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) {
      console.error('Failed to insert order items:', itemsError.message)
      throw new Error(`Order placed but items could not be saved: ${itemsError.message}`)
    }

    // Insert initial tracking
    await supabase.from('order_tracking').insert({
      order_id: order.id,
      status: 'placed',
      message: 'Your order has been placed successfully! 🎉',
      updated_by: 'system',
    })

    return order
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return }
    if (items.length === 0) { toast.error('Cart is empty'); return }

    setPlacing(true)

    try {
      if (paymentMethod === 'cod') {
        const order = await createOrderInDB('pending')
        clearCart()
        navigate(`/order-success/${order.id}`)
      } else {
        // Razorpay flow
        const { data: rzpOrderData, error: fnError } = await supabase.functions.invoke('create-razorpay-order', {
          body: { amount: total, currency: 'INR' },
        })

        if (fnError || !rzpOrderData?.id) {
          // Fallback: use mock ID for demo
          const mockRzpOrderId = `order_demo_${Date.now()}`
          openRazorpayCheckout({
            orderId: mockRzpOrderId,
            amount: total,
            customerName: customer?.full_name,
            customerPhone: customer?.phone,
            onSuccess: async (payData) => {
              const order = await createOrderInDB('paid', payData)
              clearCart()
              navigate(`/order-success/${order.id}`)
            },
            onFailure: (msg) => {
              toast.error(msg || 'Payment failed')
              setPlacing(false)
            },
          })
          setPlacing(false)
          return
        }

        openRazorpayCheckout({
          orderId: rzpOrderData.id,
          amount: total,
          customerName: customer?.full_name,
          customerPhone: customer?.phone,
          onSuccess: async (payData) => {
            try {
              const order = await createOrderInDB('paid', payData)
              clearCart()
              navigate(`/order-success/${order.id}`)
            } catch {
              toast.error('Order creation failed')
              setPlacing(false)
            }
          },
          onFailure: (msg) => {
            toast.error(msg === 'Payment cancelled' ? 'Payment was cancelled' : `Payment failed: ${msg}`)
            setPlacing(false)
          },
        })
        setPlacing(false)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order')
      setPlacing(false)
    }
  }

  return (
    <div className="pb-nav bg-[#FFFDF7] min-h-screen page-enter">
      <PageTopBar title="Checkout" />

      <div className="p-4 space-y-4">
        {/* Delivery Address */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">Delivery Address</h3>
            <button
              onClick={() => setShowAddAddress(true)}
              className="flex items-center gap-1 text-xs font-semibold text-[#2D6A4F]"
            >
              <Plus size={14} />
              Add New
            </button>
          </div>

          {loading ? (
            <SkeletonList count={2} />
          ) : addresses.length === 0 ? (
            <button
              onClick={() => setShowAddAddress(true)}
              className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-4 text-sm text-gray-500 font-medium text-center"
            >
              + Add delivery address
            </button>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  selected={selectedAddress?.id === addr.id}
                  onSelect={() => setSelectedAddress(addr)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Order Summary ({items.length} items)</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{item.name} × {item.quantity}</span>
                <span className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Delivery Slot</span>
              <span className="font-medium text-gray-800">{deliverySlot}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery Fee</span>
              <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : 'text-gray-800'}>
                {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base text-gray-900">
              <span>Total</span>
              <span className="text-[#2D6A4F]">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Payment Method</h3>
          <div className="space-y-2">
            {[
              { value: 'razorpay', label: 'Pay Online', subtitle: 'UPI, Cards, Netbanking & more', icon: CreditCard },
              { value: 'cod', label: 'Cash on Delivery', subtitle: 'Pay when your order arrives', icon: Banknote },
            ].map(({ value, label, subtitle, icon: Icon }) => (
              <div
                key={value}
                onClick={() => setPaymentMethod(value)}
                className="flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all"
                style={{ borderColor: paymentMethod === value ? '#2D6A4F' : '#E5E7EB', background: paymentMethod === value ? '#2D6A4F08' : 'white' }}
              >
                <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-[#2D6A4F]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{subtitle}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === value ? 'border-[#2D6A4F] bg-[#2D6A4F]' : 'border-gray-300'}`}>
                  {paymentMethod === value && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Place Order */}
        <button
          onClick={handlePlaceOrder}
          disabled={placing || !selectedAddress}
          className="w-full h-14 bg-[#2D6A4F] rounded-2xl text-white font-bold text-base disabled:opacity-60 transition-all active:scale-98"
        >
          {placing ? 'Placing Order...' : `Place Order — ${formatPrice(total)}`}
        </button>
      </div>

      {showAddAddress && (
        <AddAddressModal
          onSave={(addr) => {
            setAddresses((prev) => [addr, ...prev])
            setSelectedAddress(addr)
          }}
          onClose={() => setShowAddAddress(false)}
        />
      )}
    </div>
  )
}
