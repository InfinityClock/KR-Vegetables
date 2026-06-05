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

// ─── Date range helpers ──────────────────────────────────────────────────────
function getDateRange(preset) {
  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  switch (preset) {
    case 'today':     return { from: today, to: null }
    case 'yesterday': {
      const y = new Date(today); y.setDate(y.getDate() - 1)
      return { from: y, to: today }
    }
    case 'week': {
      const w = new Date(today); w.setDate(w.getDate() - 7)
      return { from: w, to: null }
    }
    case 'month': {
      const m = new Date(today); m.setDate(m.getDate() - 30)
      return { from: m, to: null }
    }
    default: return { from: null, to: null }
  }
}

/**
 * useAdminOrders — full search + filter + pagination for the admin orders page.
 *
 * @param {object} filters
 *   statusFilter   — order status ('all' | 'placed' | 'confirmed' | ...)
 *   search         — free text (order number, customer name, phone)  [debounced]
 *   paymentFilter  — 'all' | 'cod' | 'zoho' | 'failed'
 *   dateFilter     — 'all' | 'today' | 'yesterday' | 'week' | 'month'
 *   slotFilter     — 'all' | 'morning' | 'afternoon'
 */
export const useAdminOrders = ({
  statusFilter  = 'all',
  search        = '',
  paymentFilter = 'all',
  dateFilter    = 'all',
  slotFilter    = 'all',
} = {}) => {
  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error,       setError]       = useState(null)
  const [hasMore,     setHasMore]     = useState(false)
  const [totalCount,  setTotalCount]  = useState(null)
  const [cursor,      setCursor]      = useState(null)

  // Debounced search — 350ms prevents a query on every keypress
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(timer)
  }, [search])

  const fetchPage = useCallback(async (afterCursor = null, append = false) => {
    if (append) setLoadingMore(true)
    else        setLoading(true)
    setError(null)

    try {
      // ── Step 1: resolve customer IDs when searching by name/phone ────────
      // Two-pass search avoids needing a complex JOIN in PostgREST.
      let customerIdFilter = null  // null = no customer filter

      const q = debouncedSearch.trim()
      if (q) {
        const isOrderNumber = /^\d+$/.test(q) || q.toUpperCase().startsWith('KR')
        if (!isOrderNumber) {
          // Search customers by name OR phone in parallel
          const [nameRes, phoneRes] = await Promise.all([
            supabase.from('customers').select('id').ilike('full_name', `%${q}%`).limit(100),
            supabase.from('customers').select('id').ilike('phone', `%${q}%`).limit(100),
          ])
          const ids = new Set([
            ...((nameRes.data || []).map(c => c.id)),
            ...((phoneRes.data || []).map(c => c.id)),
          ])
          customerIdFilter = [...ids]
          // If no customers match, there are no matching orders
          if (customerIdFilter.length === 0) {
            setOrders(append ? orders => orders : [])
            setHasMore(false)
            setTotalCount(0)
            setLoading(false)
            setLoadingMore(false)
            return
          }
        }
      }

      // ── Step 2: Build the orders query ───────────────────────────────────
      let ordersQuery = supabase
        .from('orders')
        .select('*, customers(full_name, phone), addresses(address_line1, address_line2, city, pincode, lat, lng)', {
          count: afterCursor ? undefined : 'exact',
        })
        .order('placed_at', { ascending: false })
        .limit(PAGE_SIZE)

      // Status filter
      if (statusFilter !== 'all') ordersQuery = ordersQuery.eq('status', statusFilter)

      // Payment filter
      if (paymentFilter === 'cod')         ordersQuery = ordersQuery.eq('payment_method', 'cod')
      if (paymentFilter === 'cod_pending') ordersQuery = ordersQuery.eq('payment_method', 'cod').eq('payment_status', 'pending')
      if (paymentFilter === 'online')      ordersQuery = ordersQuery.in('payment_method', ['zoho', 'razorpay'])
      if (paymentFilter === 'failed')      ordersQuery = ordersQuery.eq('payment_status', 'failed')

      // Date filter
      const { from: dateFrom, to: dateTo } = getDateRange(dateFilter)
      if (dateFrom) ordersQuery = ordersQuery.gte('placed_at', dateFrom.toISOString())
      if (dateTo)   ordersQuery = ordersQuery.lt('placed_at',  dateTo.toISOString())

      // Delivery slot filter
      if (slotFilter === 'morning')   ordersQuery = ordersQuery.ilike('delivery_slot', '%8AM%')
      if (slotFilter === 'afternoon') ordersQuery = ordersQuery.ilike('delivery_slot', '%3PM%')

      // Text search — order number or customer lookup
      if (q) {
        if (customerIdFilter !== null) {
          // Phone/name search — filter by resolved customer IDs
          ordersQuery = ordersQuery.in('customer_id', customerIdFilter)
        } else {
          // Order number / numeric ID search
          ordersQuery = ordersQuery.ilike('order_number', `%${q}%`)
        }
      }

      // Keyset pagination
      if (afterCursor) ordersQuery = ordersQuery.lt('placed_at', afterCursor)

      const { data: ordersData, error: err, count } = await ordersQuery
      if (err) { setError(err.message); return }

      const rows = ordersData || []
      if (count != null) setTotalCount(count)

      // ── Step 3: Fetch order items for this page ──────────────────────────
      if (rows.length > 0) {
        const orderIds = rows.map(o => o.id)
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('id, order_id, product_name, unit, quantity, unit_price, total_price')
          .in('order_id', orderIds)

        const byOrder = {}
        ;(itemsData || []).forEach(item => {
          if (!byOrder[item.order_id]) byOrder[item.order_id] = []
          byOrder[item.order_id].push(item)
        })
        rows.forEach(o => { o.order_items = byOrder[o.id] || [] })
      }

      setOrders(prev => append ? [...prev, ...rows] : rows)
      setHasMore(rows.length === PAGE_SIZE)
      setCursor(rows.length > 0 ? rows[rows.length - 1].placed_at : null)
    } catch (err) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [debouncedSearch, statusFilter, paymentFilter, dateFilter, slotFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset and reload whenever any filter changes
  useEffect(() => {
    setCursor(null)
    setTotalCount(null)
    fetchPage(null, false)
  }, [fetchPage])

  const loadMore = useCallback(() => {
    if (cursor && !loadingMore) fetchPage(cursor, true)
  }, [cursor, loadingMore, fetchPage])

  const refetch = useCallback(() => {
    setCursor(null)
    setTotalCount(null)
    fetchPage(null, false)
  }, [fetchPage])

  // Realtime — refetch on DB changes (only when no search active to avoid noise)
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        // Don't interrupt an active search — only auto-refresh when idle
        if (!debouncedSearch) refetch()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [refetch, debouncedSearch])

  return { orders, loading, loadingMore, hasMore, totalCount, error, refetch, loadMore }
}

// ─────────────────────────────────────────────────────────────────────────────
// useCustomerOrders — phone-based guest order history
//
// Since customers have no Supabase auth accounts, phone is their identity.
// A 30-minute sessionStorage cache prevents re-fetching on every navigation.
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_KEY = 'kr-order-history'
const SESSION_TTL = 30 * 60 * 1000  // 30-minute sessionStorage cache (same tab)
const PHONE_KEY   = 'kr-customer-phone'  // persisted across sessions (localStorage)

function getCachedSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (Date.now() - data.fetchedAt > SESSION_TTL) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }
    return data
  } catch { return null }
}

function setCachedSession(phone, customerName, orders, hasMore, total) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      phone, customerName, orders, hasMore, total,
      fetchedAt: Date.now(),
    }))
  } catch {}
}

/** Returns the phone number saved when the customer last placed an order. */
export function getSavedPhone() {
  try { return localStorage.getItem(PHONE_KEY) || null } catch { return null }
}

export function clearOrderHistorySession() {
  try { sessionStorage.removeItem(SESSION_KEY) } catch {}
}

export function clearSavedPhone() {
  try { localStorage.removeItem(PHONE_KEY) } catch {}
  clearOrderHistorySession()
}

export function useCustomerOrders() {
  const cached     = getCachedSession()
  const savedPhone = getSavedPhone()

  const [phone,        setPhone]        = useState(cached?.phone        || savedPhone || '')
  const [customerName, setCustomerName] = useState(cached?.customerName || null)
  const [orders,       setOrders]       = useState(cached?.orders       || [])
  const [hasMore,      setHasMore]      = useState(cached?.hasMore      || false)
  const [total,        setTotal]        = useState(cached?.total        || 0)
  const [loading,      setLoading]      = useState(false)
  const [loadingMore,  setLoadingMore]  = useState(false)
  const [error,        setError]        = useState(null)
  const [verified,     setVerified]     = useState(!!cached)
  // autoLoad = true means we detected the phone from localStorage and are
  // triggering the lookup automatically (no manual form submission needed)
  const [autoLoading,  setAutoLoading]  = useState(!cached && !!savedPhone)

  const fetchOrders = useCallback(async (phoneNum, cursor = null, append = false) => {
    if (append) setLoadingMore(true)
    else        setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/customer-orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: phoneNum, cursor }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Could not load orders.')
        setAutoLoading(false)
        return
      }

      const next = append ? [...orders, ...(data.orders || [])] : (data.orders || [])
      setOrders(next)
      setHasMore(data.hasMore || false)
      setTotal(data.total  ?? total)
      setCustomerName(data.customerName || null)
      setVerified(true)
      setAutoLoading(false)

      if (!append) {
        setCachedSession(phoneNum, data.customerName, data.orders, data.hasMore, data.total)
      } else {
        setCachedSession(phoneNum, customerName, next, data.hasMore, data.total)
      }
    } catch {
      setError('Network error. Please try again.')
      setAutoLoading(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [orders, total, customerName]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-trigger: if the customer placed an order before on this device,
  // their phone is in localStorage — load history immediately without
  // showing the phone entry form.
  useEffect(() => {
    if (!cached && savedPhone && !verified) {
      fetchOrders(savedPhone)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const lookup = useCallback((phoneNum) => {
    const digits = phoneNum.replace(/\D/g, '').slice(-10)
    setPhone(digits)
    setAutoLoading(false)
    fetchOrders(digits)
  }, [fetchOrders])

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || !orders.length) return
    const cursor = orders[orders.length - 1]?.placed_at
    fetchOrders(phone, cursor, true)
  }, [orders, hasMore, loadingMore, phone, fetchOrders])

  const reset = useCallback(() => {
    clearSavedPhone()
    setPhone('')
    setCustomerName(null)
    setOrders([])
    setHasMore(false)
    setTotal(0)
    setVerified(false)
    setAutoLoading(false)
    setError(null)
  }, [])

  return {
    phone, customerName, orders, hasMore, total,
    loading, loadingMore, autoLoading, error, verified,
    lookup, loadMore, reset,
  }
}
