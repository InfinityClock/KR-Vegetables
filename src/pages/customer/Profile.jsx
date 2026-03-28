import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, MapPin, Package, Phone, LogOut, Plus, Edit2, Trash2, Star, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { PageTopBar } from '../../components/TopBar'
import EmptyState from '../../components/EmptyState'
import { WHATSAPP_NUMBER } from '../../constants'
import toast from 'react-hot-toast'

function AddressItem({ address, onDelete, onSetDefault }) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-2xl border border-gray-100 p-3">
      <MapPin size={18} className="text-[#2D6A4F] flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-bold text-gray-900">{address.label}</span>
          {address.is_default && (
            <span className="text-xs bg-[#2D6A4F]/10 text-[#2D6A4F] px-1.5 py-0.5 rounded-full font-medium">Default</span>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {address.address_line1}{address.address_line2 && `, ${address.address_line2}`}
          <br />{address.city} — {address.pincode}
        </p>
      </div>
      <div className="flex gap-2">
        {!address.is_default && (
          <button onClick={() => onSetDefault(address.id)} className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center">
            <Star size={12} className="text-green-600" />
          </button>
        )}
        <button onClick={() => onDelete(address.id)} className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
          <Trash2 size={12} className="text-red-500" />
        </button>
      </div>
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, customer, logout } = useAuthStore()
  const [addresses, setAddresses] = useState([])
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(customer?.full_name || '')
  const [savingName, setSavingName] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('addresses')
      .select('*')
      .eq('customer_id', user.id)
      .order('is_default', { ascending: false })
      .then(({ data }) => setAddresses(data || []))
  }, [user])

  const handleSaveName = async () => {
    if (!newName.trim()) return
    setSavingName(true)
    const { error } = await supabase
      .from('customers')
      .update({ full_name: newName.trim() })
      .eq('id', user.id)
    setSavingName(false)
    if (error) { toast.error('Failed to update name'); return }
    useAuthStore.getState().setCustomer({ ...customer, full_name: newName.trim() })
    setEditingName(false)
    toast.success('Name updated!')
  }

  const handleDeleteAddress = async (id) => {
    const { error } = await supabase.from('addresses').delete().eq('id', id)
    if (!error) {
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      toast.success('Address deleted')
    }
  }

  const handleSetDefault = async (id) => {
    await supabase.from('addresses').update({ is_default: false }).eq('customer_id', user.id)
    await supabase.from('addresses').update({ is_default: true }).eq('id', id)
    setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })))
    toast.success('Default address updated')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  if (!user) {
    return (
      <div className="pb-nav min-h-screen bg-[#FFFDF7] page-enter">
        <PageTopBar title="Profile" showBack={false} />
        <EmptyState
          icon="👤"
          title="Not logged in"
          subtitle="Sign in to access your profile and order history"
          action={{ label: 'Login', onClick: () => navigate('/auth') }}
        />
      </div>
    )
  }

  const menuItems = [
    { icon: Package, label: 'My Orders', onClick: () => navigate('/orders') },
    {
      icon: Phone, label: 'Contact Support',
      onClick: () => window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent('Hi! I need help with my order.')}`, '_blank')
    },
  ]

  return (
    <div className="pb-nav min-h-screen bg-[#FFFDF7] page-enter">
      <PageTopBar title="Profile" showBack={false} />

      <div className="p-4 space-y-4">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-[#2D6A4F] rounded-2xl flex items-center justify-center">
              <User size={28} className="text-white" />
            </div>
            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 text-base font-bold border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:border-[#2D6A4F]"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="px-3 py-1.5 bg-[#2D6A4F] text-white rounded-xl text-sm font-semibold"
                  >
                    {savingName ? '...' : 'Save'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">{customer?.full_name || 'Customer'}</h2>
                  <button onClick={() => { setEditingName(true); setNewName(customer?.full_name || '') }}>
                    <Edit2 size={14} className="text-gray-400" />
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-500">{customer?.phone || user.phone}</p>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <MapPin size={16} className="text-[#2D6A4F]" />
              My Addresses
            </h3>
            <button
              onClick={() => navigate('/checkout')}
              className="text-xs font-semibold text-[#2D6A4F] flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {addresses.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">No saved addresses</p>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <AddressItem
                  key={addr.id}
                  address={addr}
                  onDelete={handleDeleteAddress}
                  onSetDefault={handleSetDefault}
                />
              ))}
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {menuItems.map(({ icon: Icon, label, onClick }, i) => (
            <button
              key={label}
              onClick={onClick}
              className={`w-full flex items-center gap-3 px-4 py-4 text-left ${i > 0 ? 'border-t border-gray-50' : ''}`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#2D6A4F]/10 flex items-center justify-center">
                <Icon size={18} className="text-[#2D6A4F]" />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-800">{label}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          ))}
        </div>

        {/* App version */}
        <div className="text-center">
          <p className="text-xs text-gray-400">KR Vegetables & Fruits · v1.0.0</p>
          <p className="text-xs text-gray-400">Fresh daily from local farms 🌿</p>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full h-12 border-2 border-red-100 rounded-2xl text-red-500 font-semibold text-sm flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  )
}
