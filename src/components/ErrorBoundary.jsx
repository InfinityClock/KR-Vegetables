import { Component } from 'react'
import { WHATSAPP_NUMBER } from '../constants'
import { supabase } from '../lib/supabase'

/**
 * React Error Boundary — catches any render-time errors in its subtree
 * and shows a recovery UI instead of a blank white screen.
 *
 * Usage:
 *   <ErrorBoundary>          ← wraps the entire app
 *   <ErrorBoundary admin>    ← wraps admin panel only (tighter scope)
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack)
    // Send to client_errors so a crash on a device we don't have physical
    // access to is still diagnosable — previously this only reached
    // console.error, which is invisible once the user closes the tab.
    // Fire-and-forget; logging a crash must never itself be able to crash.
    try {
      supabase.from('client_errors').insert({
        message:         error?.message || String(error),
        stack:            error?.stack || null,
        component_stack:  info?.componentStack || null,
        boundary:         this.props.admin ? 'admin' : 'customer',
        url:              typeof window !== 'undefined' ? window.location.href : null,
        user_agent:       typeof navigator !== 'undefined' ? navigator.userAgent : null,
      }).then(() => {}, () => {})
    } catch { /* logging must never throw */ }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const { admin } = this.props
    const wa = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I encountered an error on the KR Vegetables app. Can you help?')}`

    if (admin) {
      // Compact admin error — doesn't need the full brand treatment
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#f9fafb', fontFamily: 'var(--font-body)',
        }}>
          <div style={{
            maxWidth: 480, width: '100%', margin: 16,
            background: '#fff', border: '1px solid #fca5a5',
            borderRadius: 16, padding: 32, textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              Admin panel error
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
              Something went wrong in the admin panel.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre style={{
                textAlign: 'left', fontSize: 11, background: '#f3f4f6',
                padding: '10px 12px', borderRadius: 8, overflowX: 'auto',
                color: '#374151', marginBottom: 16, maxHeight: 160,
              }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                height: 40, padding: '0 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'var(--brand-700)', color: '#fff', fontWeight: 600, fontSize: 13,
              }}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    // Customer-facing error — full brand treatment
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 24,
        background: 'var(--bg-base)', fontFamily: 'var(--font-body)',
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🌿</div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700,
          color: 'var(--text-dark)', textAlign: 'center', marginBottom: 10,
        }}>
          Something went wrong
        </h1>

        <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 320, marginBottom: 32, lineHeight: 1.6 }}>
          Something went wrong. Your cart is safe. Tap below to reload.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              height: 52, borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'var(--brand-800)', color: '#fff',
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15,
            }}
          >
            Reload Page
          </button>

          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            style={{
              height: 48, borderRadius: 14,
              border: '1.5px solid #bbf7d0', textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              color: '#16a34a', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
            }}
          >
            💬 Get help on WhatsApp
          </a>

          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
            style={{
              height: 44, borderRadius: 14, border: '1px solid var(--border)',
              background: 'var(--bg-card)', cursor: 'pointer',
              color: 'var(--text-mid)', fontFamily: 'var(--font-body)', fontSize: 14,
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }
}
