import { Link } from 'react-router-dom'
import { Phone, MessageCircle, MapPin, Clock, ArrowLeft, Leaf } from 'lucide-react'
import { STORE_ADDRESS, STORE_MAPS_URL, STORE_MAPS_EMBED, STORE_PHONE, WHATSAPP_NUMBER, STORE_NAME } from '../../constants'

export default function Contact() {
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg, var(--brand-900) 0%, var(--teal-900) 100%)', padding: '40px 24px 36px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-body)', fontSize: '13px',
              color: 'rgba(255,255,255,.5)', textDecoration: 'none', marginBottom: 20,
            }}
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={18} style={{ color: 'var(--teal-300)' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)' }}>
              {STORE_NAME}
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', fontWeight: 700, color: '#fff', letterSpacing: '-.03em', lineHeight: 1.15, margin: 0 }}>
            Contact Us
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(255,255,255,.5)', marginTop: 8, marginBottom: 0 }}>
            We're here to help. Reach us by phone, WhatsApp, or visit our store.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* ── Row 1: Phone + WhatsApp side by side on desktop ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            marginBottom: 16,
          }}
        >
          {/* Phone */}
          <a href={`tel:${STORE_PHONE.replace(/\s/g, '')}`} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow-sm)', height: '100%' }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} style={{ color: 'var(--brand-600)' }} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 3px' }}>Phone</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--brand-700)', margin: 0, letterSpacing: '-.01em' }}>{STORE_PHONE}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Tap to call</p>
              </div>
            </div>
          </a>

          {/* WhatsApp */}
          <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid #bbf7d0', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow-sm)', height: '100%' }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle size={20} style={{ color: '#16a34a' }} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 3px' }}>WhatsApp</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: '#16a34a', margin: 0, letterSpacing: '-.01em' }}>{STORE_PHONE}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>We reply fast</p>
              </div>
            </div>
          </a>
        </div>

        {/* ── Business Address card ── */}
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={20} style={{ color: 'var(--teal-600)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 4px' }}>Business Address</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14.5px', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>{STORE_NAME}</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text-mid)', margin: '3px 0 10px', lineHeight: 1.55 }}>{STORE_ADDRESS}</p>
            <a
              href={STORE_MAPS_URL}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: '12.5px', fontWeight: 600, color: 'var(--teal-600)', textDecoration: 'none' }}
            >
              <MapPin size={12} /> Open in Google Maps →
            </a>
          </div>
        </div>

        {/* ── Embedded Map ── */}
        <div
          style={{
            borderRadius: 18,
            overflow: 'hidden',
            border: '1.5px solid var(--border-light)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: 16,
            lineHeight: 0,
          }}
        >
          <iframe
            src={STORE_MAPS_EMBED}
            width="100%"
            height="320"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="KR Vegetables & Fruits — Store Location"
          />
        </div>

        {/* ── Delivery Hours ── */}
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, boxShadow: 'var(--shadow-sm)', marginBottom: 32 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, background: 'var(--amber-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} style={{ color: 'var(--amber-600)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 8px' }}>Delivery Hours</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { slot: 'Morning Slot',   time: '8:00 AM – 1:00 PM' },
                { slot: 'Afternoon Slot', time: '3:00 PM – 8:00 PM' },
              ].map(({ slot, time }) => (
                <div key={slot} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-mid)' }}>{slot}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)' }}>{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Divider + Policy links ── */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 24 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px' }}>
            Policies
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { to: '/terms',         label: 'Terms of Service' },
              { to: '/refund-policy', label: 'Refund & Cancellation Policy' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--brand-600)', textDecoration: 'none', fontWeight: 500 }}>
                {label} →
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
