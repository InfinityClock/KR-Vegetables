import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export const useOrders = (filter = 'all') => {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const fetch = async () => {
      setLoading(true)
      let query = supabase
        .from('orders')
        .select(`*, order_items(*)`)
        .eq('customer_id', user.id)
        .order('placed_at', { ascending: false })

      if (filter === 'active') query = query.in('status', ['placed', 'confirmed', 'packing', 'out_for_delivery'])
      if (filter === 'delivered') query = query.eq('status', 'delivered')
      if (filter === 'cancelled') query = query.eq('status', 'cancelled')

      const { data, error: err } = await query
      if (err) setError(err.message)
      else setOrders(data || [])
      setLoading(false)
    }
    fetch()
  }, [user, filter])

  return { orders, loading, error }
}

export const useOrder = (orderId) => {
  const [order, setOrder] = useState(null)
  const [tracking, setTracking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return
    const fetch = async () => {
      const [orderRes, trackingRes] = await Promise.all([
        supabase
          .from('orders')
          .select(`*, order_items(*), addresses(*)`)
          .eq('id', orderId)
          .single(),
        supabase
          .from('order_tracking')
          .select('*')
          .eq('order_id', orderId)
          .order('updated_at', { ascending: true }),
      ])
      setOrder(orderRes.data)
      setTracking(trackingRes.data || [])
      setLoading(false)
    }
    fetch()

    // Realtime subscription
    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => setOrder(payload.new)
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_tracking', filter: `order_id=eq.${orderId}` },
        (payload) => setTracking((prev) => [...prev, payload.new])
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [orderId])

  return { order, tracking, loading }
}

export const useAdminOrders = (statusFilter = 'all') => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrders = async () => {
    setLoading(true)

    // Step 1: Fetch orders + customer + address (no order_items join — avoids broken admin RLS)
    let query = supabase
      .from('orders')
      .select(`*, customers(full_name, phone), addresses(address_line1, address_line2, city, pincode)`)
      .order('placed_at', { ascending: false })
      .limit(200)

    if (statusFilter !== 'all') query = query.eq('status', statusFilter)

    const { data: ordersData, error: err } = await query
    if (err) { setError(err.message); setLoading(false); return }

    const orders = ordersData || []

    // Step 2: Fetch order_items in a separate query so RLS is evaluated
    // per-item row (uses order_items_own policy) instead of through the join.
    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id)
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('id, order_id, product_name, unit, quantity, unit_price, total_price')
        .in('order_id', orderIds)

      // Group items by order_id and attach to each order
      const byOrder = {}
      ;(itemsData || []).forEach((item) => {
        if (!byOrder[item.order_id]) byOrder[item.order_id] = []
        byOrder[item.order_id].push(item)
      })
      orders.forEach((o) => { o.order_items = byOrder[o.id] || [] })
    }

    setOrders(orders)
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [statusFilter])

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  return { orders, loading, error, refetch: fetchOrders }
}
