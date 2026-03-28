import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export const useAuthInit = () => {
  const { setSession, setCustomer } = useAuthStore()

  useEffect(() => {
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
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setCustomer(data)
  }
}

export const useStoreSettings = () => {
  const [settings, setSettings] = [null, () => {}]
  return settings
}
