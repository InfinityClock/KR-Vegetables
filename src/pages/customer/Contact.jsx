import { Link } from 'react-router-dom'
import { Phone, MessageCircle, MapPin, Clock, ArrowLeft, Mail, Leaf } from 'lucide-react'
import { STORE_ADDRESS, STORE_MAPS_URL, STORE_PHONE, WHATSAPP_NUMBER, STORE_NAME } from '../../constants'

export default function Contact() {
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>

      {/* ── Header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--brand-900) 0%, var(--teal-900) 100%)',
          padding: '40px 24px 36px',
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-body)', fontSize: '13px',
              color: 'rgba(255,255,255,.55)', textDecoration: 'none',
              marginBottom: 20,
            }}
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Leaf size={18} style={{ color: 'var(--teal-300)' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>
              {STORE_NAME}
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 5vw, 2.4rem)',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-.03em',
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Contact Us
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(255,255,255,.55)', marginTop: 8, marginBottom: 0 }}>
            We're here to help. Reach us by phone, WhatsApp, or visit our store.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Contact cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>

          {/* Phone */}
          <a
            href={`tel:${STORE_PHONE.replace(/\s/g, '')}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border-light)',
                borderRadius: 16,
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                boxShadow: 'var(--shadow-sm)',
                transition: 'box-shadow .15s',
              }}
            >
              <div
                style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: 'var(--brand-50)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Phone size={20} style={{ color: 'var(--brand-600)' }} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 2px' }}>
                  Phone
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, color: 'var(--brand-700)', margin: 0, letterSpacing: '-.01em' }}>
                  {STORE_PHONE}
                </p>
              </div>
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border-light)',
                borderRadius: 16,
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: '#f0fdf4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <MessageCircle size={20} style={{ color: '#16a34a' }} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 2px' }}>
                  WhatsApp
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, color: '#16a34a', margin: 0, letterSpacing: '-.01em' }}>
                  {STORE_PHONE}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Chat with us on WhatsApp — we reply fast
                </p>
              </div>
            </div>
          </a>

          {/* Address */}
          <a
            href={STORE_MAPS_URL}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border-light)',
                borderRadius: 16,
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: 'var(--teal-50)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <MapPin size={20} style={{ color: 'var(--teal-600)' }} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 4px' }}>
                  Business Address
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14.5px', fontWeight: 600, color: 'var(--text-dark)', margin: 0, lineHeight: 1.55 }}>
                  {STORE_NAME}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text-mid)', margin: '2px 0 0', lineHeight: 1.55 }}>
                  {STORE_ADDRESS}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', color: 'var(--teal-600)', margin: '6px 0 0', fontWeight: 600 }}>
                  View on Google Maps →
                </p>
              </div>
            </div>
          </a>

          {/* Business Hours */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border-light)',
              borderRadius: 16,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'var(--amber-50)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Clock size={20} style={{ color: 'var(--amber-600)' }} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 6px' }}>
                Delivery Hours
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { slot: 'Morning Slot',   time: '8:00 AM – 1:00 PM' },
                  { slot: 'Afternoon Slot', time: '3:00 PM – 8:00 PM' },
                ].map(({ slot, time }) => (
                  <div key={slot} style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-mid)' }}>{slot}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border-light)', marginBottom: 24 }} />

        {/* Policy links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>
            Policies
          </p>
          {[
            { to: '/terms',         label: 'Terms of Service' },
            { to: '/refund-policy', label: 'Refund & Cancellation Policy' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '14px',
                color: 'var(--brand-600)', textDecoration: 'none', fontWeight: 500,
              }}
            >
              {label} →
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
