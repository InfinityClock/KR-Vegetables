import { useState } from 'react'
import { useUiStore } from '../store/uiStore'

const slides = [
  {
    emoji: '🥬🥕🍅',
    title: 'Farm Fresh Every Day',
    subtitle: 'Vegetables and fruits picked fresh each morning. Delivered to Chennai homes daily.',
    bg: '#1B4332',
    light: '#52B788',
  },
  {
    emoji: '⚡',
    title: 'Order in 60 Seconds',
    subtitle: 'Tap a category, add what you need, checkout. It really is that fast.',
    bg: '#0D3B5E',
    light: '#FEFAE0',
  },
  {
    emoji: '🚚',
    title: 'Two Delivery Windows Daily',
    subtitle: 'Morning 8AM–1PM or afternoon 3PM–8PM. Free delivery on every order.',
    bg: '#2D6A4F',
    light: '#FEFAE0',
  },
]

export default function Onboarding() {
  const [current, setCurrent] = useState(0)
  const setOnboardingDone = useUiStore((s) => s.setOnboardingDone)

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1)
    else setOnboardingDone()
  }

  const slide = slides[current]

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-500"
      style={{ background: slide.bg }}
    >
      {/* Skip */}
      <button
        onClick={setOnboardingDone}
        className="absolute top-12 right-6 text-sm font-semibold px-4 py-1.5 rounded-full"
        style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(4px)' }}
      >
        Skip
      </button>

      {/* Content */}
      <div className="flex flex-col items-center text-center px-8 max-w-sm">
        <div className="text-8xl mb-8 animate-bounce">{slide.emoji}</div>
        <h2 className="text-3xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {slide.title}
        </h2>
        <p className="text-white/80 text-base leading-relaxed">{slide.subtitle}</p>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-12">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all ${i === current ? 'w-8 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/40'}`}
          />
        ))}
      </div>

      {/* Button */}
      <button
        onClick={next}
        className="mt-8 px-10 py-4 bg-white rounded-2xl font-bold text-base transition-all active:scale-95"
        style={{ color: slide.bg }}
      >
        {current === slides.length - 1 ? 'Get Started 🎉' : 'Next →'}
      </button>
    </div>
  )
}
