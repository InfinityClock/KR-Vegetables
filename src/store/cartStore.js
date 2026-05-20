import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useSettingsStore } from './settingsStore'

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
    }),
    {
      name: 'kr-cart',
      partialize: (state) => ({ items: state.items, notes: state.notes }),
    }
  )
)

// Selector hooks for performance
export const useCartItems = () => useCartStore((s) => s.items)
export const useCartCount = () => useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
export const useCartSubtotal = () => useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0))
export const useCartTotal = () => {
  const sub = useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0))
  const { delivery_fee, free_delivery_above } = useSettingsStore()
  return sub + (sub >= free_delivery_above ? 0 : delivery_fee)
}
export const useCartDeliveryFee = () => {
  const sub = useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0))
  const { delivery_fee, free_delivery_above } = useSettingsStore()
  return sub >= free_delivery_above ? 0 : delivery_fee
}
