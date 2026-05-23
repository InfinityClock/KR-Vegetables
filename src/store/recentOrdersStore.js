import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MAX_ITEMS = 24  // keep up to 24 unique products

export const useRecentOrdersStore = create(
  persist(
    (set, get) => ({
      items: [],   // [{ id, name, unit, price, original_price, image_url, last_ordered }]

      /**
       * Called right after a successful order.
       * Merges cartItems into the store, de-duplicating by product ID.
       * Most recently ordered items bubble to the front.
       */
      addOrderedItems: (cartItems) => {
        if (!cartItems?.length) return
        const now = new Date().toISOString()
        const existing = get().items

        const map = new Map(existing.map((i) => [i.id, i]))

        for (const item of cartItems) {
          if (!item.id) continue
          map.set(item.id, {
            id:             item.id,
            name:           item.name,
            unit:           item.unit,
            price:          item.price,
            original_price: item.original_price ?? null,
            image_url:      item.image_url ?? null,
            last_ordered:   now,
          })
        }

        // Sort by last_ordered desc, keep only MAX_ITEMS
        const sorted = [...map.values()]
          .sort((a, b) => new Date(b.last_ordered) - new Date(a.last_ordered))
          .slice(0, MAX_ITEMS)

        set({ items: sorted })
      },

      clearHistory: () => set({ items: [] }),
    }),
    {
      name: 'kr-recent-orders',
    }
  )
)
