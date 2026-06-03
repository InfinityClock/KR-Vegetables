import { useSeo } from '../../hooks/useSeo'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Leaf } from 'lucide-react'
import { ADMIN_EMAIL, WHATSAPP_NUMBER, STORE_NAME, STORE_ADDRESS } from '../../constants'

const LAST_UPDATED = 'June 2026'

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

export default function PrivacyPolicy() {
  useSeo({
    title: 'Privacy Policy',
    description: `${STORE_NAME} privacy policy: how we collect, use, and protect your personal information.`,
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
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'var(--text-dark)',
            letterSpacing: '-.02em',
          }}
        >
          Privacy Policy
        </h1>
      </header>

      <div className="px-5 pt-6 pb-10 flex flex-col gap-8" style={{ maxWidth: 720, margin: '0 auto' }}>

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
            At {STORE_NAME}, we respect your privacy. This policy explains what information we
            collect, why we collect it, and how we use it when you shop with us.
          </p>
        </div>

        <Section title="1. Who We Are">
          <p>{STORE_NAME} is a fresh vegetable and fruit delivery service operating in Chennai, India.</p>
          <p>📍 {STORE_ADDRESS}</p>
          <p>✉️ <a href={`mailto:${ADMIN_EMAIL}`} style={{ color: 'var(--brand-600)', fontWeight: 600 }}>{ADMIN_EMAIL}</a></p>
        </Section>

        <Section title="2. What Information We Collect">
          <p>When you place an order, we collect:</p>
          <Bullet><strong>Full name</strong>: to identify your order and delivery.</Bullet>
          <Bullet><strong>Phone number</strong>: to send order updates via WhatsApp and contact you about your delivery.</Bullet>
          <Bullet><strong>Delivery address</strong>: street, area, city, pincode, and optionally GPS coordinates.</Bullet>
          <Bullet><strong>Order details</strong>: items ordered, quantities, amounts, and timestamps.</Bullet>
          <p style={{ marginTop: 4 }}>We do <strong>not</strong> collect your email address, payment card details (these are handled entirely by Zoho Payments and never touch our servers), or any government ID.</p>
        </Section>

        <Section title="3. How We Use Your Information">
          <Bullet>To process and deliver your order to the correct address.</Bullet>
          <Bullet>To send you order confirmation, status updates, and delivery notifications via WhatsApp.</Bullet>
          <Bullet>To contact you if there is an issue with your order (e.g., an item is out of stock).</Bullet>
          <Bullet>To improve our service and understand ordering patterns (analysed in aggregate, not individually).</Bullet>
          <Bullet>We may occasionally send you promotional offers via WhatsApp if you have previously ordered from us. You can opt out at any time by replying "STOP".</Bullet>
        </Section>

        <Section title="4. How We Store Your Information">
          <Bullet>Your data is stored securely in <strong>Supabase</strong>, a cloud database platform hosted within the EU/US with industry-standard encryption at rest and in transit.</Bullet>
          <Bullet>Your delivery address and phone number are retained to make future orders easier and to allow order tracking.</Bullet>
          <Bullet>We do not store payment card or UPI details. All online payments are processed by Zoho Payments under their own privacy policy.</Bullet>
        </Section>

        <Section title="5. Sharing Your Information">
          <p>We do <strong>not sell, rent, or share</strong> your personal information with any third party for marketing purposes.</p>
          <p>Your information may be shared only in these limited circumstances:</p>
          <Bullet>With our delivery team, solely to fulfil your order (name, address, phone).</Bullet>
          <Bullet>With payment providers (Zoho Payments) to process transactions. They receive only the minimum data necessary.</Bullet>
          <Bullet>If required by law or a valid legal order from Indian authorities.</Bullet>
        </Section>

        <Section title="6. Your Rights">
          <Bullet><strong>Access:</strong> You can ask us what personal information we hold about you.</Bullet>
          <Bullet><strong>Correction:</strong> You can ask us to correct inaccurate information.</Bullet>
          <Bullet><strong>Deletion:</strong> You can ask us to delete your data. We will comply within 30 days, except where we are legally required to retain order records.</Bullet>
          <Bullet><strong>Opt-out:</strong> You can opt out of WhatsApp marketing messages at any time by replying "STOP" or contacting us.</Bullet>
          <p style={{ marginTop: 4 }}>
            To exercise any of these rights, contact us at{' '}
            <a href={`mailto:${ADMIN_EMAIL}`} style={{ color: 'var(--brand-600)', fontWeight: 600 }}>{ADMIN_EMAIL}</a>
            {' '}or WhatsApp us at {WHATSAPP_NUMBER}.
          </p>
        </Section>

        <Section title="7. Cookies & Tracking">
          <p>Our website uses:</p>
          <Bullet><strong>localStorage / sessionStorage</strong>: stores your cart, checkout state, and preferences locally in your browser. This data never leaves your device.</Bullet>
          <Bullet>We do <strong>not</strong> use advertising cookies, third-party tracking pixels, or analytics tools that track you across other websites.</Bullet>
        </Section>

        <Section title="8. Children's Privacy">
          <p>
            Our service is intended for adults. We do not knowingly collect personal information
            from anyone under 13 years of age. If you believe we have inadvertently collected
            such information, please contact us immediately.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We may update this Privacy Policy periodically. The "Last updated" date at the top
            of this page will always reflect the most recent revision. Continued use of our
            service after a change constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>Questions or concerns about your privacy?</p>
          <div className="flex flex-col gap-3 mt-1">
            <a
              href={`mailto:${ADMIN_EMAIL}`}
              style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--brand-600)', fontWeight: 600 }}
            >
              ✉️ {ADMIN_EMAIL}
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 self-start px-4 py-2.5 rounded-full font-semibold text-sm"
              style={{ background: '#25D366', color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-body)' }}
            >
              💬 Chat on WhatsApp
            </a>
          </div>
        </Section>

        <div
          className="px-4 py-4 rounded-2xl text-center"
          style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--brand-700)', lineHeight: 1.6 }}>
            Your trust matters to us. We keep your data only as long as we need it and
            never share it for profit. 🌿
          </p>
        </div>

      </div>
    </div>
  )
}
