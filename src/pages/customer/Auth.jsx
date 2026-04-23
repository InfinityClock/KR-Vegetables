import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, ArrowLeft, Leaf } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function Auth({ redirectTo = '/' }) {
  const navigate = useNavigate()
  const { setCustomer } = useAuthStore()
  const [step, setStep] = useState('phone') // phone | otp | name
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const formatPhone = (val) => {
    const digits = val.replace(/\D/g, '')
    return digits.slice(0, 10)
  }

  const sendOtp = async () => {
    if (phone.length !== 10) { toast.error('Enter a valid 10-digit mobile number'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${phone}`,
      })
      if (error) throw error
      setStep('otp')
      toast.success('OTP sent to your number!')
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+91${phone}`,
        token: otp,
        type: 'sms',
      })
      if (error) throw error

      // Check if customer exists
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (!customer) {
        setStep('name')
      } else {
        setCustomer(customer)
        toast.success(`Welcome back, ${customer.full_name}! 👋`)
        navigate(redirectTo)
      }
    } catch (err) {
      toast.error(err.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const saveName = async () => {
    if (!name.trim()) { toast.error('Please enter your name'); return }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const customerData = {
        id: user.id,
        full_name: name.trim(),
        phone: `+91${phone}`,
        email: user.email || null,
      }
      const { data, error } = await supabase
        .from('customers')
        .upsert(customerData)
        .select()
        .single()
      if (error) throw error
      setCustomer(data)
      toast.success(`Welcome to KR Vegetables & Fruits, ${name}! 🌿`)
      navigate(redirectTo)
    } catch (err) {
      toast.error(err.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col">
      {/* Header */}
      <div className="p-4">
        <button onClick={() => step === 'phone' ? navigate(-1) : setStep('phone')} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center pt-4 pb-8">
        <div className="w-20 h-20 bg-[#2D6A4F] rounded-3xl flex items-center justify-center mb-4 shadow-lg">
          <Leaf size={36} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#2D6A4F]" style={{ fontFamily: 'var(--font-display)' }}>
          KR Vegetables & Fruits
        </h1>
        <p className="text-gray-500 text-sm mt-1">Fresh daily from local farms 🌿</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6">
        {step === 'phone' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>Enter your number</h2>
              <p className="text-gray-500 text-sm">We'll send you a one-time password</p>
            </div>

            <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-2xl px-4 h-14 focus-within:border-[#2D6A4F] transition-colors">
              <Phone size={18} className="text-gray-400" />
              <span className="text-gray-600 font-medium">+91</span>
              <div className="w-px h-6 bg-gray-200" />
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="10-digit mobile number"
                className="flex-1 outline-none text-base text-gray-900 bg-transparent"
                maxLength={10}
              />
            </div>

            <button
              onClick={sendOtp}
              disabled={loading || phone.length !== 10}
              className="w-full h-14 bg-[#2D6A4F] text-white rounded-2xl font-bold text-base disabled:opacity-60 transition-all active:scale-98"
            >
              {loading ? 'Sending OTP...' : 'Get OTP →'}
            </button>

            <p className="text-xs text-center text-gray-400">
              By continuing, you agree to our Terms & Privacy Policy
            </p>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>Verify OTP</h2>
              <p className="text-gray-500 text-sm">Enter the 6-digit OTP sent to +91 {phone}</p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl px-4 h-14 flex items-center focus-within:border-[#2D6A4F] transition-colors">
              <input
                type="tel"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                className="w-full outline-none text-2xl font-bold text-center tracking-widest bg-transparent text-gray-900"
                maxLength={6}
                autoFocus
              />
            </div>

            <button
              onClick={verifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full h-14 bg-[#2D6A4F] text-white rounded-2xl font-bold text-base disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify & Continue →'}
            </button>

            <button onClick={sendOtp} className="w-full text-sm text-[#2D6A4F] font-medium text-center">
              Resend OTP
            </button>
          </div>
        )}

        {step === 'name' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>What's your name?</h2>
              <p className="text-gray-500 text-sm">Help us personalize your experience</p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl px-4 h-14 flex items-center focus-within:border-[#2D6A4F] transition-colors">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full outline-none text-base text-gray-900 bg-transparent"
                autoFocus
              />
            </div>

            <button
              onClick={saveName}
              disabled={loading || !name.trim()}
              className="w-full h-14 bg-[#2D6A4F] text-white rounded-2xl font-bold text-base disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Start Shopping 🛒'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
