import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { HANDLING_CHARGE_RATE } from '../constants'

export const useSettingsStore = create((set) => ({
  handling_charge_rate: HANDLING_CHARGE_RATE,
  // Default open until we hear otherwise — prevents false "store closed" on load
  store_open: true,
  loaded: false,

  loadSettings: async () => {
    const { data } = await supabase.from('store_settings').select('key, value')
    if (!data) return
    const map = {}
    data.forEach((s) => { map[s.key] = s.value })
    set({
      handling_charge_rate: map.handling_charge_rate ? Number(map.handling_charge_rate) : HANDLING_CHARGE_RATE,
      // store_open is stored as the string 'true'/'false' in the DB.
      // '...' !== 'false' means: open unless explicitly set to 'false'.
      store_open:           map.store_open !== 'false',
      loaded: true,
    })
  },
}))
