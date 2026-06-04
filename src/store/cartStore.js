import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { useSettingsStore } from './settingsStore'
import { HANDLING_CHARGE_RATE } from '../constants'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      notes: '',

      addItem: (product, quantity = 1) => {
        const { items } = get()
        const existing = items.find((i) => i.id === product.id)
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          })
        } else {
          set({
            items: [
              ...items,
              {
                id: product.id,
                name: product.name,
                unit: product.unit,
                price: product.offer_price || product.price,
                original_price: product.offer_price ? product.price : null,
                image_url: product.image_url,
                quantity,
              },
            ],
          })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.id !== productId) })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.id === productId ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [], notes: '' }),

      setNotes: (notes) => set({ notes }),

      /**
       * Refreshes all cart item prices from the database.
       * Called after a checkout error to ensure the customer sees current prices
       * before retrying. Returns an array of items whose price changed.
       */
      refreshPrices: async () => {
        const { items } = get()
        if (!items.length) return []
        const ids = items.map((i) => i.id).filter(Boolean)
        const { data } = await supabase
          .from('products')
          .select('id, price, offer_price, is_active, stock_status')
          .in('id', ids)
        if (!data) return []

        const changed = []
        const updated = items.map((item) => {
          const fresh = data.find((p) => p.id === item.id)
          if (!fresh) return item
          const currentPrice = fresh.offer_price !== null ? fresh.offer_price : fresh.price
          if (currentPrice !== item.price) {
            changed.push({ name: item.name, oldPrice: item.price, newPrice: currentPrice })
            return { ...item, price: currentPrice }
          }
          return item
        })

        if (changed.length) set({ items: updated })
        return changed
      },
    }),
    {
      name: 'kr-cart',
      partialize: (state) => ({ items: state.items, notes: state.notes }),
    }
  )
)

// Selector hooks for performance
export const useCartItems = () => useCartStore((s) => s.items)
// Cart badge shows unique product count (matches "My Cart (N)" title in Cart page)
export const useCartCount = () => useCartStore((s) => s.items.length)
export const useCartSubtotal = () => useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0))

export const useCartHandlingFee = () => {
  const sub = useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0))
  const { handling_charge_rate } = useSettingsStore()
  return Math.ceil(sub * (handling_charge_rate ?? HANDLING_CHARGE_RATE))
}

export const useCartTotal = () => {
  const sub = useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0))
  const { handling_charge_rate } = useSettingsStore()
  return sub + Math.ceil(sub * (handling_charge_rate ?? HANDLING_CHARGE_RATE))
}
