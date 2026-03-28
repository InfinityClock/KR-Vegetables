import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Package, ShoppingBag, Share2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatPrice, formatDateTime } from '../../utils/format'
import { WHATSAPP_NUMBER } from '../../constants'

export default function OrderSuccess() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return
    supabase
      .from('orders')
      .select('*, order_items(product_name, quantity, unit), addresses(*)')
      .eq('id', orderId)
      .single()
      .then(({ data }) => { setOrder(data); setLoading(false) })
  }, [orderId])

  const handleShare = () => {
    const msg = `🌿 My order ${order?.order_number} is placed at KR Vegetables & Fruits! Fresh veggies arriving at ${order?.delivery_slot}. 🚚`
    if (navigator.share) {
      navigator.share({ title: 'Order Placed!', text: msg, url: window.location.origin })
    } else {
      const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
      window.open(url, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-6 page-enter">
      {/* Animated checkmark */}
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <CheckCircle size={52} className="text-[#2D6A4F]" strokeWidth={1.5} />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
        Order Placed! 🎉
      </h1>

      {order && (
        <>
          <div className="bg-[#2D6A4F]/10 px-6 py-2 rounded-2xl mb-2">
            <span className="text-[#2D6A4F] font-bold text-lg tracking-wide">{order.order_number}</span>
          </div>
          <p className="text-gray-500 text-sm mb-1">Placed on {formatDateTime(order.placed_at)}</p>
          <p className="text-[#2D6A4F] font-semibold text-sm mb-6">🕐 Delivery slot: {order.delivery_slot}</p>

          {/* Order details card */}
          <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 p-4 mb-6 space-y-2">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              {order.order_items?.length} items ordered
            </h3>
            {order.order_items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.product_name} × {item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-sm">
              <span>Total paid</span>
              <span className="text-[#2D6A4F]">{formatPrice(order.total_amount)}</span>
            </div>
            <div className="text-xs text-gray-500">
              {order.payment_method === 'cod' ? '💵 Cash on Delivery' : '✅ Paid Online'}
            </div>
          </div>
        </>
      )}

      {/* CTAs */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => navigate(`/track/${orderId}`)}
          className="w-full h-14 bg-[#2D6A4F] rounded-2xl text-white font-bold flex items-center justify-center gap-2"
        >
          <Package size={20} />
          Track My Order
        </button>

        <button
          onClick={handleShare}
          className="w-full h-12 border-2 border-[#2D6A4F] rounded-2xl text-[#2D6A4F] font-bold flex items-center justify-center gap-2"
        >
          <Share2 size={18} />
          Share on WhatsApp
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full h-12 bg-white border border-gray-200 rounded-2xl text-gray-700 font-semibold flex items-center justify-center gap-2"
        >
          <ShoppingBag size={18} />
          Continue Shopping
        </button>
      </div>
    </div>
  )
}
