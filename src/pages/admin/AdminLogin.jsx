import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import logoImg from '../../assets/Logo.jpg'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState(false)

  // ── Password reset mode ────────────────────────────────────────────────────
  // Supabase sends a recovery link to /admin/login#access_token=xxx&type=recovery
  // We detect the hash, set the session, and show the "new password" form.
  const [resetMode, setResetMode] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [settingPassword, setSettingPassword] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    if (!hash.includes('type=recovery')) return

    const params = new URLSearchParams(hash.slice(1))
    const accessToken  = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (error) { toast.error('Reset link is invalid or expired. Please request a new one.'); return }
          setResetMode(true)
          // Clean the hash so the token isn't exposed in the URL bar
          window.history.replaceState(null, '', '/admin/login')
        })
    }
  }, [])

  const handleSetNewPassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8)            { toast.error('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword)   { toast.error('Passwords do not match'); return }
    setSettingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSettingPassword(false)
    if (error) { toast.error(error.message); return }
    toast.success('Password updated! Please sign in with your new password.')
    setResetMode(false)
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleForgotPassword = async () => {
    if (!email) { toast.error('Enter your email address first'); return }
    setResetting(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`,
    })
    setResetting(false)
    if (error) toast.error(error.message)
    else toast.success('Password reset email sent. Check your inbox.')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // Only check app_metadata — it is server-only and cannot be written by the user.
      // user_metadata is writable via supabase.auth.updateUser() and must never
      // be used for authorization decisions.
      const appMetadata = data.user?.app_metadata || {}
      const role = appMetadata.role || null

      if (!['admin', 'sales'].includes(role)) {
        await supabase.auth.signOut()
        toast.error(`Access denied. Role "${role || 'none'}" is not authorized.`)
        setLoading(false)
        return
      }

      navigate('/admin')
      toast.success('Welcome back!')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // ── Set New Password form (shown after clicking a reset email link) ──────────
  if (resetMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(150deg,#031a0e 0%,#052e16 30%,#0a4529 60%,#115e59 100%)' }}>
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-7">
            <div className="rounded-3xl p-4 mb-4" style={{ background: 'rgba(255,255,255,.96)', boxShadow: '0 12px 40px rgba(0,0,0,.3)' }}>
              <img src={logoImg} alt="KR Vegetables & Fruits" style={{ height: 80, width: 'auto', objectFit: 'contain', display: 'block' }} />
            </div>
            <p className="text-sm font-semibold tracking-widest uppercase" style={{ color: 'rgba(94,234,212,.7)', letterSpacing: '.15em' }}>Set New Password</p>
          </div>
          <div className="rounded-3xl p-7 space-y-4" style={{ background: 'rgba(255,255,255,.97)', boxShadow: '0 24px 64px rgba(0,0,0,.3)' }}>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-display)' }}>Create new password</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Choose a strong password for your admin account</p>
            </div>
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-mid)' }}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="w-full h-12 px-4 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid var(--border)', color: 'var(--text-dark)', background: 'var(--gray-50)' }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-mid)' }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  required
                  className="w-full h-12 px-4 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid var(--border)', color: 'var(--text-dark)', background: 'var(--gray-50)' }}
                />
              </div>
              <button
                type="submit"
                disabled={settingPassword}
                className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
                style={{ background: settingPassword ? 'var(--teal-400)' : 'linear-gradient(135deg,var(--brand-700) 0%,var(--teal-600) 100%)', border: 'none', cursor: settingPassword ? 'wait' : 'pointer' }}
              >
                <KeyRound size={15} />
                {settingPassword ? 'Saving…' : 'Set New Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
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
              style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-display)' }}
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

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetting}
                className="text-xs font-medium transition-colors"
                style={{ color: 'var(--teal-600)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {resetting ? 'Sending…' : 'Forgot password?'}
              </button>
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
