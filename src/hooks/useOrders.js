import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export const useOrders = (filter = 'all') => {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const loadOrders = async () => {
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
    loadOrders()
  }, [user, filter])

  return { orders, loading, error }
}

export const useOrder = (orderId) => {
  const [order, setOrder] = useState(null)
  const [tracking, setTracking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return
    const loadOrder = async () => {
      const [orderRes, trackingRes] = await Promise.all([
        supabase
          .from('orders')
          .select(`*, order_items(*, products(id, name, image_url)), addresses(*)`)
          .eq('id', orderId)
          .single(),
        supabase
          .from('order_tracking')
          .select('*')
          .eq('order_id', orderId)
          .order('updated_at', { ascending: true }),
      ])

      if (orderRes.data) {
        // Authenticated user — RLS allowed the read
        setOrder(orderRes.data)
        setTracking(trackingRes.data || [])
      } else {
        // Guest user or RLS blocked — fall back to the public tracking API.
        // /api/track-order?orderId=<uuid> returns order + tracking without auth.
        try {
          const res = await fetch(`/api/track-order?orderId=${orderId}`)
          if (res.ok) {
            const data = await res.json()
            setOrder(data)
            setTracking(data.order_tracking || [])
          }
        } catch { /* leave order null — tracking page will show "not found" */ }
      }

      setLoading(false)
    }
    loadOrder()

    // Realtime subscription (only meaningful for authenticated users with RLS access)
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

const PAGE_SIZE = 50

export const useAdminOrders = (statusFilter = 'all') => {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error,    setError]    = useState(null)
  const [hasMore,  setHasMore]  = useState(false)
  // cursor = placed_at of the last loaded order (for keyset pagination)
  const [cursor,   setCursor]   = useState(null)

  const fetchPage = useCallback(async (afterCursor = null, append = false) => {
    if (append) setLoadingMore(true)
    else        setLoading(true)

    let query = supabase
      .from('orders')
      .select('*, customers(full_name, phone), addresses(address_line1, address_line2, city, pincode)')
      .order('placed_at', { ascending: false })
      .limit(PAGE_SIZE)

    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    // Keyset pagination: fetch orders placed before the cursor timestamp
    if (afterCursor) query = query.lt('placed_at', afterCursor)

    const { data: ordersData, error: err } = await query
    if (err) {
      setError(err.message)
      setLoading(false)
      setLoadingMore(false)
      return
    }

    const rows = ordersData || []

    // Fetch order items for this page
    if (rows.length > 0) {
      const orderIds = rows.map((o) => o.id)
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('id, order_id, product_name, unit, quantity, unit_price, total_price')
        .in('order_id', orderIds)

      const byOrder = {}
      ;(itemsData || []).forEach((item) => {
        if (!byOrder[item.order_id]) byOrder[item.order_id] = []
        byOrder[item.order_id].push(item)
      })
      rows.forEach((o) => { o.order_items = byOrder[o.id] || [] })
    }

    setOrders((prev) => append ? [...prev, ...rows] : rows)
    setHasMore(rows.length === PAGE_SIZE)
    setCursor(rows.length > 0 ? rows[rows.length - 1].placed_at : null)
    setLoading(false)
    setLoadingMore(false)
  }, [statusFilter])

  // Reset and reload whenever filter changes
  useEffect(() => {
    setCursor(null)
    fetchPage(null, false)
  }, [fetchPage])

  const loadMore = useCallback(() => {
    if (cursor && !loadingMore) fetchPage(cursor, true)
  }, [cursor, loadingMore, fetchPage])

  const refetch = useCallback(() => {
    setCursor(null)
    fetchPage(null, false)
  }, [fetchPage])

  // Realtime — single stable channel; refetches current first page on any change
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, refetch)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [refetch])

  return { orders, loading, loadingMore, hasMore, error, refetch, loadMore }
}
