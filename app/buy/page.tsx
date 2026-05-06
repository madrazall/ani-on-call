'use client'

import { useState } from 'react'
import { CREDIT_PACKAGES, type CreditPackage } from '@/lib/packages'

export default function BuyPage() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleBuy(pkg: CreditPackage) {
    setLoading(pkg.id)

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: pkg.id }),
    })

    if (!res.ok) {
      setLoading(null)
      return
    }

    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold text-gray-900 mb-2">Get credits</h1>
      <p className="text-gray-500 mb-12">
        Credits are used when you run an analysis. You only pay for what you run.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {CREDIT_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className="border border-gray-200 rounded-xl p-6 flex flex-col gap-4 hover:border-gray-400 transition-colors"
          >
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                {pkg.name}
              </p>
              <p className="text-3xl font-bold text-gray-900">{pkg.displayPrice}</p>
              <p className="text-sm text-gray-500 mt-1">{pkg.credits} credits</p>
            </div>

            <p className="text-sm text-gray-600 flex-1">{pkg.description}</p>

            <button
              onClick={() => handleBuy(pkg)}
              disabled={loading !== null}
              className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {loading === pkg.id ? 'Redirecting…' : 'Buy'}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-8">
        Credits don&apos;t expire. No subscription. No refunds if a report runs clean.
      </p>
    </div>
  )
}
