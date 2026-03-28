import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '../constants'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      deliverySlot: 'Morning 7AM–10AM',
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

      clearCart: () => set({ items: [], notes: '', deliverySlot: 'Morning 7AM–10AM' }),

      setDeliverySlot: (slot) => set({ deliverySlot: slot }),
      setNotes: (notes) => set({ notes }),

      // Computed
      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      },

      get deliveryFee() {
        const sub = get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
        return sub >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
      },

      get total() {
        const sub = get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
        const fee = sub >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
        return sub + fee
      },
    }),
    {
      name: 'kr-cart',
      partialize: (state) => ({ items: state.items, deliverySlot: state.deliverySlot, notes: state.notes }),
    }
  )
)

// Selector hooks for performance
export const useCartItems = () => useCartStore((s) => s.items)
export const useCartCount = () => useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
export const useCartSubtotal = () => useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0))
export const useCartTotal = () => useCartStore((s) => {
  const sub = s.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const fee = sub >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  return sub + fee
})
export const useCartDeliveryFee = () => useCartStore((s) => {
  const sub = s.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  return sub >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
})
