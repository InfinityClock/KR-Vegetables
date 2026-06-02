import { useSeo } from '../../hooks/useSeo'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Leaf } from 'lucide-react'
import { STORE_ADDRESS, WHATSAPP_NUMBER, ADMIN_EMAIL } from '../../constants'

const LAST_UPDATED = 'May 2026'

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-3">
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: 600,
          color: 'var(--text-dark)',
          letterSpacing: '-.02em',
          paddingBottom: 6,
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        {title}
      </h2>
      <div
        className="flex flex-col gap-2"
        style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.75 }}
      >
        {children}
      </div>
    </section>
  )
}

function Bullet({ children }) {
  return (
    <div className="flex items-start gap-2.5">
      <Leaf size={13} style={{ color: 'var(--brand-500)', flexShrink: 0, marginTop: 4 }} />
      <p>{children}</p>
    </div>
  )
}

export default function Terms() {
  useSeo({ title: 'Terms of Service', description: 'Terms and conditions for using KR Vegetables & Fruits grocery delivery service.' })
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
          Terms of Service
        </h1>
      </header>

      <div className="px-5 pt-6 pb-10 flex flex-col gap-8" style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Intro */}
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
            Welcome to KR Vegetables &amp; Fruits. These terms are written in plain language to help
            you understand how we work. By placing an order with us, you agree to the following.
          </p>
        </div>

        {/* 1 */}
        <Section title="1. About Us">
          <p>
            KR Vegetables &amp; Fruits is a fresh produce delivery service based in Chennai.
            We source vegetables and fruits daily from local farms and deliver them to your door.
          </p>
          <p>📍 {STORE_ADDRESS}</p>
          <p>📱 +91 9176260992 (WhatsApp preferred)</p>
          <p>✉️ <a href={`mailto:${ADMIN_EMAIL}`} style={{ color: 'var(--brand-600)', fontWeight: 600 }}>{ADMIN_EMAIL}</a></p>
        </Section>

        {/* 2 */}
        <Section title="2. Placing an Order">
          <Bullet>You can place orders through our website without creating an account — no registration needed.</Bullet>
          <Bullet>There is no minimum order amount. Order as little or as much as you need.</Bullet>
          <Bullet>Orders are accepted based on product availability. We will notify you via WhatsApp if any item in your order is unavailable and adjust your total accordingly.</Bullet>
          <Bullet>You'll receive your order number on the confirmation screen. Save it to track your delivery at any time.</Bullet>
        </Section>

        {/* 3 */}
        <Section title="3. Delivery">
          <Bullet>We currently deliver within our serviceable area around Thalambur and nearby localities in Chennai.</Bullet>
          <Bullet>We deliver in two daily windows: <strong>Morning 8:00 AM – 1:00 PM</strong> and <strong>Afternoon 3:00 PM – 8:00 PM</strong>.</Bullet>
          <Bullet>Orders are automatically assigned to the next available window based on order time. No slot selection is required.</Bullet>
          <Bullet><strong>Delivery is always free</strong> — no minimum order, no delivery fee, on every order.</Bullet>
          <Bullet>Delivery times are estimates. Occasional delays may occur due to weather, traffic, or high volume. We'll keep you updated via WhatsApp.</Bullet>
          <Bullet>Please ensure someone is available to receive your order during the delivery window.</Bullet>
          <p style={{ marginTop: 4 }}>
            <Link to="/shipping-policy" style={{ color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--brand-200)' }}>
              Read our full Shipping Policy →
            </Link>
          </p>
        </Section>

        {/* 4 */}
        <Section title="4. Freshness &amp; Quality">
          <Bullet>All our produce is sourced fresh daily. We do our best to ensure quality at every step.</Bullet>
          <Bullet>Weights and sizes of vegetables and fruits are natural and may vary slightly from what is shown.</Bullet>
          <Bullet>If you receive a damaged or incorrect item, please contact us on WhatsApp within 24 hours of delivery with a photo. We'll make it right — either with a replacement or a refund.</Bullet>
        </Section>

        {/* 5 */}
        <Section title="5. Payments">
          <Bullet>We accept online payment (via Zoho Pay) and Cash on Delivery (COD).</Bullet>
          <Bullet>Prices shown are inclusive of all applicable taxes.</Bullet>
          <Bullet>Prices may change based on market rates. The price at the time of your order is what you'll be charged.</Bullet>
          <Bullet>For online payments, your transaction is processed securely. We do not store any card or payment details.</Bullet>
        </Section>

        {/* 6 */}
        <Section title="6. Cancellations &amp; Refunds">
          <Bullet>You can cancel your order before it is confirmed by our team. Please WhatsApp us as soon as possible.</Bullet>
          <Bullet>Once an order is confirmed and packing has begun, we are unable to cancel it as fresh produce is perishable.</Bullet>
          <Bullet>We do not offer cash refunds. If you receive a rotten or faulty item, we will replace it free of charge in your next delivery after reviewing your complaint.</Bullet>
          <p style={{ marginTop: 4 }}>
            <Link to="/refund-policy" style={{ color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--brand-200)' }}>
              Read our full Refund &amp; Cancellation Policy →
            </Link>
          </p>
        </Section>

        {/* 7 */}
        <Section title="7. Your Information">
          <Bullet>We collect your name, phone number, and delivery address solely to process and deliver your order.</Bullet>
          <Bullet>We do not sell or share your personal information with third parties.</Bullet>
          <Bullet>We may send you order updates and occasional offers via WhatsApp. You can opt out at any time by messaging us.</Bullet>
        </Section>

        {/* 8 */}
        <Section title="8. Store Availability">
          <Bullet>We operate based on store hours configured by our team. The website will clearly indicate when the store is closed.</Bullet>
          <Bullet>You can browse and add items to your cart even when the store is closed, but checkout will only be available during open hours.</Bullet>
        </Section>

        {/* 9 */}
        <Section title="9. Changes to These Terms">
          <p>
            We may update these terms from time to time. If we make significant changes, we'll
            let you know. Continuing to use our service after an update means you accept the
            revised terms.
          </p>
        </Section>

        {/* 10 */}
        <Section title="10. Contact Us">
          <p>
            Have a question or concern? We're always happy to help.
          </p>
          <div className="flex flex-col gap-3 mt-1">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 self-start px-4 py-2.5 rounded-full font-semibold text-sm"
              style={{ background: '#25D366', color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-body)' }}
            >
              💬 Chat on WhatsApp
            </a>
            <a
              href={`mailto:${ADMIN_EMAIL}`}
              style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--brand-600)', fontWeight: 600 }}
            >
              ✉️ {ADMIN_EMAIL}
            </a>
          </div>
        </Section>

        {/* Footer note */}
        <div
          className="px-4 py-4 rounded-2xl text-center"
          style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--brand-700)', lineHeight: 1.6 }}>
            Thank you for choosing KR Vegetables &amp; Fruits. 🌿<br />
            We're committed to bringing you the freshest produce, every day.
          </p>
        </div>

      </div>
    </div>
  )
}
