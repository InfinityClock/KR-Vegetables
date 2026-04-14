import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const userMetadata = data.user?.user_metadata || {}
      const appMetadata = data.user?.app_metadata || {}
      const ADMIN_EMAIL = 'krajesh@gmail.com'
      const role = userMetadata.role || appMetadata.role || (data.user?.email === ADMIN_EMAIL ? 'admin' : null)

      if (role !== 'admin') {
        await supabase.auth.signOut()
        toast.error(`Access denied. Role "${role || 'none'}" is not "admin".`)
        setLoading(false)
        return
      }

      if (!userMetadata.role) {
        await supabase.auth.updateUser({ data: { role: 'admin' } })
      }

      navigate('/admin')
      toast.success('Welcome back!')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: 'linear-gradient(160deg, var(--brand-900) 0%, var(--brand-700) 60%, var(--brand-500) 100%)',
      }}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,.2) 0%, transparent 50%)',
        }}
      />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 font-black text-white text-2xl"
            style={{
              background: 'rgba(255,255,255,.15)',
              border: '1.5px solid rgba(255,255,255,.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,.2)',
            }}
          >
            KR
          </div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '-.02em' }}
          >
            KR Vegetables
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,.6)' }}>Admin Dashboard</p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-7 space-y-4"
          style={{
            background: '#fff',
            boxShadow: '0 24px 64px rgba(0,0,0,.25)',
          }}
        >
          <div className="mb-2">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Playfair Display, serif' }}>
              Sign in
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Enter your admin credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-mid)' }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@krvegetables.com"
                required
                className="w-full h-12 px-4 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid var(--border)',
                  color: 'var(--text-dark)',
                  background: 'var(--gray-50)',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.background = '#fff' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--gray-50)' }}
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-mid)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 px-4 pr-11 rounded-xl text-sm outline-none transition-all"
                  style={{
                    border: '1.5px solid var(--border)',
                    color: 'var(--text-dark)',
                    background: 'var(--gray-50)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.background = '#fff' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--gray-50)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
              style={{
                background: loading ? 'var(--brand-400)' : 'var(--brand-700)',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(22,101,52,.3)',
              }}
            >
              <Lock size={15} />
              {loading ? 'Signing in…' : 'Sign In to Admin'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,.4)' }}>
          KR Vegetables & Fruits · Admin v1.0
        </p>
      </div>
    </div>
  )
}
