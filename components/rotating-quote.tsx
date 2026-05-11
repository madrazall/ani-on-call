'use client'

import { useState, useEffect } from 'react'

const QUOTES = [
  "I'm filling orders around the clock. Why am I barely making a profit?",
  "The rates I'm paying don't match my agreement with the carrier.",
  "Do I really need insurance on every order?",
  "My shipping costs went up $400 this month and I don't know why.",
  "I'm pretty sure I've been double-charged. I just can't prove it.",
  "My margins look fine on paper. Something doesn't add up.",
  "Why does Ground cost more than Priority sometimes?",
  "I feel like I'm leaving money on the table but I don't know where to look.",
]

export default function RotatingQuote() {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'visible' | 'flipOut' | 'flipIn'>('visible')

  useEffect(() => {
    const interval = setInterval(() => {
      // Flip out
      setPhase('flipOut')

      setTimeout(() => {
        // Swap text while hidden
        setIndex((i) => (i + 1) % QUOTES.length)
        setPhase('flipIn')

        setTimeout(() => {
          setPhase('visible')
        }, 350)
      }, 350)
    }, 4500)

    return () => clearInterval(interval)
  }, [])

  const transform =
    phase === 'flipOut'
      ? 'rotateX(90deg)'
      : phase === 'flipIn'
      ? 'rotateX(-90deg)'
      : 'rotateX(0deg)'

  const opacity = phase === 'visible' ? 1 : 0

  return (
    <div style={{ perspective: '1200px' }}>
      <h1
        style={{
          transform,
          opacity,
          transition: 'transform 350ms ease-in-out, opacity 350ms ease-in-out',
          transformOrigin: 'center top',
        }}
        className="font-mono text-4xl md:text-6xl font-bold text-ani-white leading-tight tracking-tight"
      >
        &ldquo;{QUOTES[index]}&rdquo;
      </h1>
    </div>
  )
}
