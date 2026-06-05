import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'

export const useAuthInit = () => {
  const { setSession, setCustomer } = useAuthStore()
  const loadSettings = useSettingsStore((s) => s.loadSettings)

  useEffect(() => {
    loadSettings()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchCustomer(session.user.id)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) fetchCustomer(session.user.id)
      else setCustomer(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchCustomer = async (userId) => {
    if (!userId) return
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (data) setCustomer(data)
  }
}

