'use client'

import { useState } from 'react'
import { CREDIT_PACKAGES } from '@/lib/packages'
import { createCheckoutSession } from './actions'

export default function BuyPage() {
  const [pending, setPending] = useState<string | null>(null)

  async function handleBuy(packageId: string) {
    setPending(packageId)
    await createCheckoutSession(packageId)
    setPending(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="font-mono text-3xl md:text-4xl font-bold text-ani-white mb-4">
          Buy credits
        </h1>
        <p className="text-lg text-ani-muted max-w-lg mx-auto">
          No subscription. No surprise charges. Just buy what you need and use them whenever you want.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {CREDIT_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative rounded-xl border bg-ani-surface p-6 flex flex-col ${
              pkg.popular ? 'border-ani-copper-mid' : 'border-ani-border'
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-ani-copper text-ani-white text-xs font-mono font-medium px-3 py-1 rounded-full">
                Best value
              </span>
            )}

            <div className="mb-6">
              <h3 className="font-mono text-lg font-bold text-ani-white">{pkg.name}</h3>
              <p className="text-sm text-ani-muted mt-1">{pkg.description}</p>
            </div>

            <div className="mb-6">
              <span className={`font-mono text-4xl font-bold ${pkg.popular ? 'text-ani-copper' : 'text-ani-white'}`}>
                ${(pkg.price / 100).toFixed(0)}
              </span>
              <span className="text-ani-muted text-sm ml-1">/ {pkg.credits} credits</span>
            </div>

            <ul className="space-y-2 mb-8 flex-1">
              <li className="text-sm text-ani-muted flex items-start gap-2">
                <svg className="w-4 h-4 text-ani-copper mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {pkg.credits} analysis credits
              </li>
              <li className="text-sm text-ani-muted flex items-start gap-2">
                <svg className="w-4 h-4 text-ani-copper mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Never expires
              </li>
              <li className="text-sm text-ani-muted flex items-start gap-2">
                <svg className="w-4 h-4 text-ani-copper mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Plain-English results
              </li>
            </ul>

            <form action={() => handleBuy(pkg.id)}>
              <button
                type="submit"
                disabled={pending === pkg.id}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-opacity ${
                  pkg.popular
                    ? 'bg-ani-copper text-ani-white hover:opacity-90'
                    : 'border border-ani-border text-ani-white hover:border-ani-muted hover:bg-ani-surface2'
                } disabled:opacity-50`}
              >
                {pending === pkg.id ? 'Redirecting to checkout…' : `Buy ${pkg.name}`}
              </button>
            </form>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-ani-muted mt-12">
        Credits don&apos;t expire. No subscription. No refunds if a report runs clean.
      </p>
    </div>
  )
}
