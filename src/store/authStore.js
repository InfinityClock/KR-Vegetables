import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      customer: null,
      session: null,
      loading: true,
      isAdmin: false,

      setSession: (session) => {
        const user = session?.user ?? null
        const isAdmin = user?.user_metadata?.role === 'admin' || user?.app_metadata?.role === 'admin'
        set({ session, user, loading: false, isAdmin })
      },

      setCustomer: (customer) => set({ customer }),

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, customer: null, session: null, isAdmin: false })
      },

      refreshCustomer: async () => {
        const { user } = get()
        if (!user) return
        const { data } = await supabase
          .from('customers')
          .select('*')
          .eq('id', user.id)
          .single()
        if (data) set({ customer: data })
      },
    }),
    {
      name: 'kr-auth',
      partialize: (state) => ({ customer: state.customer }),
    }
  )
)
