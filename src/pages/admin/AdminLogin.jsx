import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Leaf } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const userMetadata = data.user?.user_metadata || {}
      const appMetadata = data.user?.app_metadata || {}
      const role = userMetadata.role || appMetadata.role

      console.log('DEBUG: Admin Login Attempt', { 
        email: data.user?.email, 
        userMetadata, 
        appMetadata, 
        detectedRole: role 
      })

      if (role !== 'admin') {
        await supabase.auth.signOut()
        toast.error(`Access denied. Role "${role || 'none'}" is not "admin".`)
        setLoading(false)
        return
      }

      navigate('/admin')
      toast.success('Welcome back! 👋')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#2D6A4F] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-4">
            <Leaf size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            KR Vegetables & Fruits
          </h1>
          <p className="text-white/70 text-sm mt-1">Admin Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Sign In</h2>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@krvegetables.com"
              required
              className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D6A4F]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#2D6A4F] text-white rounded-xl font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Lock size={16} />
            {loading ? 'Signing in...' : 'Sign In to Admin'}
          </button>
        </form>

        <p className="text-center text-white/50 text-xs mt-6">
          KR Vegetables & Fruits Admin v1.0
        </p>
      </div>
    </div>
  )
}
