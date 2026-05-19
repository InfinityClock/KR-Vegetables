import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, MIN_ORDER_AMOUNT } from '../constants'

export const useSettingsStore = create((set) => ({
  delivery_fee: DELIVERY_FEE,
  free_delivery_above: FREE_DELIVERY_THRESHOLD,
  min_order_amount: MIN_ORDER_AMOUNT,
  loaded: false,

  loadSettings: async () => {
    const { data } = await supabase.from('store_settings').select('key, value')
    if (!data) return
    const map = {}
    data.forEach((s) => { map[s.key] = s.value })
    set({
      delivery_fee:        map.delivery_fee        ? Number(map.delivery_fee)        : DELIVERY_FEE,
      free_delivery_above: map.free_delivery_above ? Number(map.free_delivery_above) : FREE_DELIVERY_THRESHOLD,
      min_order_amount:    map.min_order_amount    ? Number(map.min_order_amount)    : MIN_ORDER_AMOUNT,
      loaded: true,
    })
  },
}))
