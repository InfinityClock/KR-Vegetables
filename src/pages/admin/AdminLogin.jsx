import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import logoImg from '../../assets/logo.png'
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
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        /* Green → Teal gradient matching the admin sidebar — "Precision in Freshness" */
        background: 'linear-gradient(150deg, #031a0e 0%, #052e16 30%, #0a4529 60%, #115e59 100%)',
      }}
    >
      {/* Decorative orbs referencing the logo ribbon swirl */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45,212,191,.12) 0%, transparent 70%)',
          top: '-80px', right: '-80px',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 300, height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,163,74,.1) 0%, transparent 70%)',
          bottom: '-60px', left: '-60px',
        }}
      />

      <div className="w-full max-w-sm relative">
        {/* Logo — white card to display on dark background */}
        <div className="flex flex-col items-center mb-7">
          <div
            className="rounded-3xl p-4 mb-4"
            style={{
              background: 'rgba(255,255,255,.96)',
              boxShadow: '0 12px 40px rgba(0,0,0,.3), 0 4px 16px rgba(13,148,136,.2)',
            }}
          >
            <img
              src={logoImg}
              alt="KR Vegetables & Fruits"
              style={{ height: 80, width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </div>
          <p
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ color: 'rgba(94,234,212,.7)', letterSpacing: '.15em' }}
          >
            Admin Dashboard
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-7 space-y-4"
          style={{
            background: 'rgba(255,255,255,.97)',
            boxShadow: '0 24px 64px rgba(0,0,0,.3), 0 8px 24px rgba(13,148,136,.15)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="mb-2">
            <h2
              className="text-lg font-bold"
              style={{ color: 'var(--text-dark)', fontFamily: 'Playfair Display, serif' }}
            >
              Sign in
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Enter your admin credentials to continue
            </p>
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
                onFocus={(e) => { e.target.style.borderColor = 'var(--teal-500)'; e.target.style.background = '#fff' }}
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
                  onFocus={(e) => { e.target.style.borderColor = 'var(--teal-500)'; e.target.style.background = '#fff' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--gray-50)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
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
                background: loading
                  ? 'var(--teal-400)'
                  : 'linear-gradient(135deg, var(--brand-700) 0%, var(--teal-600) 100%)',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(13,148,136,.35)',
              }}
            >
              <Lock size={15} />
              {loading ? 'Signing in…' : 'Sign In to Admin'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,.3)' }}>
          KR Vegetables & Fruits · Precision in Freshness
        </p>
      </div>
    </div>
  )
}
