import { useSeo } from '../../hooks/useSeo'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Leaf, MessageCircle, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react'

const LAST_UPDATED = 'May 2026'

function Card({ icon: Icon, iconBg, iconColor, title, children }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xs)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 40, height: 40, background: iconBg }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.05rem',
            fontWeight: 600,
            color: 'var(--text-dark)',
            letterSpacing: '-.02em',
          }}
        >
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

export default function RefundPolicy() {
  useSeo({ title: 'Refund & Cancellation Policy', description: 'Learn about KR Vegetables & Fruits refund, cancellation and quality guarantee policy.' })
  const navigate = useNavigate()

  return (
    <div
      className="pb-nav page-enter"
      style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}
    >
      {/* Header */}
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
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'var(--text-dark)',
            letterSpacing: '-.02em',
          }}
        >
          Refund &amp; Cancellation Policy
        </h1>
      </header>

      <div className="px-5 pt-6 pb-10 flex flex-col gap-5" style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Intro badge */}
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
            We take pride in delivering fresh, quality produce every day. Please read our policy below so you know exactly what to expect.
          </p>
        </div>

        {/* No Refund Card */}
        <Card
          icon={AlertCircle}
          iconBg="var(--red-50)"
          iconColor="var(--red-600)"
          title="No Cash Refunds"
        >
          <p>
            We do not offer cash or payment refunds once an order has been placed and delivered.
            All sales are final.
          </p>
          <p className="mt-2" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            We work hard to ensure every order leaves our store in the best condition — and we stand behind what we deliver.
          </p>
        </Card>

        {/* Faulty Items Card */}
        <Card
          icon={RefreshCw}
          iconBg="var(--brand-50)"
          iconColor="var(--brand-600)"
          title="Faulty or Poor Quality Items"
        >
          <p>
            If you receive anything that is <strong>rotten, expired, or clearly not fresh</strong>,
            we genuinely want to know and make it right. Here's how it works:
          </p>
          <div className="flex flex-col gap-2 mt-3">
            <Bullet>
              Send us a WhatsApp message within <strong>24 hours</strong> of delivery with a quick photo of the item.
            </Bullet>
            <Bullet>
              We'll review it promptly and, if the issue is confirmed, we'll replace the item <strong>free of charge in your next delivery</strong>.
            </Bullet>
            <Bullet>
              No complicated process — just a quick chat and we'll sort it out together.
            </Bullet>
          </div>
        </Card>

        {/* Cancellation Card */}
        <Card
          icon={ShieldCheck}
          iconBg="var(--amber-50)"
          iconColor="var(--amber-700)"
          title="Order Cancellations"
        >
          <div className="flex flex-col gap-2">
            <Bullet>
              You may request a cancellation <strong>before your order is confirmed</strong> by our team. Message us on WhatsApp as soon as possible.
            </Bullet>
            <Bullet>
              Once the order is confirmed and packing has started, we are unable to cancel it — fresh produce is prepared specifically for your order.
            </Bullet>
            <Bullet>
              If we are unable to fulfil your order for any reason on our end, you will be notified and no charge will apply.
            </Bullet>
          </div>
        </Card>

        {/* Contact prompt */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0' }}
        >
          <div className="flex items-center gap-2">
            <MessageCircle size={18} style={{ color: '#16A34A' }} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, color: '#15803D' }}>
              Got an issue? Just WhatsApp us.
            </p>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: '#166534', lineHeight: 1.65 }}>
            We're a small, local team and we genuinely care about every order.
            If something isn't right, reach out — we'll always do our best to help.
          </p>
          <a
            href="https://wa.me/919176260992?text=Hi!%20I%20have%20an%20issue%20with%20my%20recent%20order."
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-full font-semibold text-sm btn-ripple"
            style={{
              background: '#25D366',
              color: '#fff',
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
            }}
          >
            💬 Chat on WhatsApp
          </a>
        </div>

      </div>
    </div>
  )
}
