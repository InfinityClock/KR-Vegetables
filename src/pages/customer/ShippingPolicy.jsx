import { useSeo } from '../../hooks/useSeo'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Leaf, Clock, Truck, MapPin, CheckCircle } from 'lucide-react'
import { WHATSAPP_NUMBER, ADMIN_EMAIL, STORE_NAME } from '../../constants'

const LAST_UPDATED = 'June 2026'

function Card({ icon: Icon, iconBg, iconColor, title, children }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xs)' }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 40, height: 40, background: iconBg }}>
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-dark)', letterSpacing: '-.02em' }}>
          {title}
        </h3>
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  )
}

function Bullet({ children }) {
  return (
    <div className="flex items-start gap-2.5">
      <Leaf size={12} style={{ color: 'var(--brand-500)', flexShrink: 0, marginTop: 5 }} />
      <p>{children}</p>
    </div>
  )
}

export default function ShippingPolicy() {
  useSeo({
    title: 'Shipping & Delivery Policy',
    description: `${STORE_NAME} delivery policy: windows, areas, free delivery, and what to expect on delivery day.`,
  })
  const navigate = useNavigate()

  return (
    <div className="pb-nav page-enter" style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>

      <header
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
        style={{
          background: 'rgba(245,242,236,.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <ArrowLeft size={18} style={{ color: 'var(--text-dark)' }} />
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-dark)', letterSpacing: '-.02em' }}>
          Shipping &amp; Delivery Policy
        </h1>
      </header>

      <div className="px-5 pt-6 pb-10 flex flex-col gap-5" style={{ maxWidth: 720, margin: '0 auto' }}>

        <div className="flex flex-col gap-2">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full self-start"
            style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}
          >
            <Leaf size={12} style={{ color: 'var(--brand-600)' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--brand-700)', letterSpacing: '.05em' }}>
              Last updated: {LAST_UPDATED}
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.75 }}>
            We deliver fresh vegetables and fruits directly to your door, daily.
            Here's everything you need to know about how delivery works.
          </p>
        </div>

        {/* Free Delivery */}
        <Card icon={CheckCircle} iconBg="#f0fdf4" iconColor="#16a34a" title="Delivery is Always Free">
          <p>
            We charge <strong>₹0 for delivery on every order</strong>, regardless of order size.
            There is no minimum order amount and no delivery fee. Ever.
          </p>
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            A small handling charge (2% of cart subtotal) covers packaging and order processing.
            This is shown clearly in your cart before you checkout.
          </p>
        </Card>

        {/* Delivery Windows */}
        <Card icon={Clock} iconBg="var(--amber-50)" iconColor="var(--amber-700)" title="Delivery Windows">
          <p>We deliver in two windows every day:</p>
          <div className="flex flex-col gap-3 mt-3">
            {[
              {
                label: 'Morning Window',
                time: '8:00 AM – 1:00 PM',
                note: 'Place your order before 12:00 noon to receive it in the morning slot.',
              },
              {
                label: 'Afternoon Window',
                time: '3:00 PM – 8:00 PM',
                note: 'Place your order before 6:00 PM to receive it in the afternoon slot.',
              },
            ].map(({ label, time, note }) => (
              <div key={label} style={{ background: 'var(--gray-50)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, color: 'var(--text-dark)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, color: 'var(--amber-700)' }}>{time}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{note}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            The checkout screen automatically shows you the next available delivery window based
            on the current time. No manual selection needed.
          </p>
        </Card>

        {/* Delivery Area */}
        <Card icon={MapPin} iconBg="var(--teal-50)" iconColor="var(--teal-600)" title="Delivery Area">
          <p>We currently deliver to areas around <strong>Thalambur</strong> and nearby localities in Chennai, including:</p>
          <div className="flex flex-col gap-1 mt-2">
            {['Thalambur', 'Perumbakkam', 'Sholinganallur', 'Karapakkam', 'Palavakkam', 'Kelambakkam', 'Navalur', 'Siruseri'].map((area) => (
              <Bullet key={area}>{area}</Bullet>
            ))}
          </div>
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            Not sure if we deliver to your area? WhatsApp us before placing your order and we'll confirm.
          </p>
        </Card>

        {/* What to Expect */}
        <Card icon={Truck} iconBg="var(--brand-50)" iconColor="var(--brand-600)" title="What to Expect on Delivery Day">
          <div className="flex flex-col gap-2">
            <Bullet>Your order will be delivered in clean, sealed bags to preserve freshness.</Bullet>
            <Bullet>Our delivery person will call or WhatsApp you when they're nearby.</Bullet>
            <Bullet>Please ensure someone is available at your address during the delivery window. If you'll be unavailable, let us know in the order notes where to leave the bag.</Bullet>
            <Bullet>All items are quality-checked before packing. If you notice any quality issue on receipt, photograph it and WhatsApp us within 24 hours.</Bullet>
          </div>
        </Card>

        {/* Delays */}
        <div
          className="rounded-2xl p-5"
          style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A' }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: '#92400E', marginBottom: 6 }}>
            ⚡ Delays & Exceptions
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: '#78350F', lineHeight: 1.7, margin: 0 }}>
            On rare occasions (heavy rain, high volume days, public holidays), deliveries may be
            delayed beyond the stated window. We'll notify you proactively via WhatsApp. Your
            order will still arrive fresh on the same day in almost all cases.
          </p>
        </div>

        {/* Contact */}
        <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: '#15803D' }}>Questions about your delivery?</p>
          <div className="flex flex-col gap-2">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-full font-semibold text-sm"
              style={{ background: '#25D366', color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-body)' }}
            >
              💬 Chat on WhatsApp
            </a>
            <a href={`mailto:${ADMIN_EMAIL}`} style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: '#15803D', fontWeight: 600, textDecoration: 'none' }}>
              ✉️ {ADMIN_EMAIL}
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
