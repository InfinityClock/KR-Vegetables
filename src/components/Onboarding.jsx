import { useState } from 'react'
import { useUiStore } from '../store/uiStore'

const slides = [
  {
    emoji: '🌱',
    title: 'Fresh Daily from Local Farms',
    subtitle: 'Hand-picked every morning, straight from farm to your table. 100% fresh, always.',
    bg: '#2D6A4F',
    light: '#52B788',
  },
  {
    emoji: '🛒',
    title: 'Order in Minutes',
    subtitle: 'Browse hundreds of fresh veggies and fruits, add to cart, checkout in just a few taps.',
    bg: '#F4A261',
    light: '#FEFAE0',
  },
  {
    emoji: '🚚',
    title: 'Delivered to Your Door',
    subtitle: 'Choose your delivery slot. We bring fresh produce right to your doorstep.',
    bg: '#52B788',
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
        className="absolute top-12 right-6 text-white/70 text-sm font-medium"
      >
        Skip
      </button>

      {/* Content */}
      <div className="flex flex-col items-center text-center px-8 max-w-sm">
        <div className="text-8xl mb-8 animate-bounce">{slide.emoji}</div>
        <h2 className="text-3xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
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
