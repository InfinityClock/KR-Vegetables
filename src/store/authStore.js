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
      userRole: null,

      setSession: (session) => {
        const user = session?.user ?? null
        const userRole =
          user?.user_metadata?.role ||
          user?.app_metadata?.role ||
          null
        const isAdmin = userRole === 'admin' || userRole === 'sales'
        set({ session, user, loading: false, isAdmin, userRole })
      },

      setCustomer: (customer) => set({ customer }),

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, customer: null, session: null, isAdmin: false, userRole: null })
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
