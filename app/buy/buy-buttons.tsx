'use client'

import { useTransition } from 'react'
import type { CreditPackage } from '@/lib/packages'

interface Props {
  packages: readonly CreditPackage[]
  action: (packageId: string) => Promise<void>
}

export default function BuyButtons({ packages, action }: Props) {
  const [pending, startTransition] = useTransition()

  function handleBuy(pkg: CreditPackage) {
    startTransition(async () => {
      await action(pkg.id)
    })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {packages.map((pkg) => (
        <div
          key={pkg.id}
          className="border border-gray-200 rounded-xl p-6 flex flex-col gap-4 hover:border-gray-400 transition-colors"
        >
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              {pkg.name}
            </p>
            <p className="text-3xl font-bold text-gray-900">${(pkg.price / 100).toFixed(0)}</p>
            <p className="text-sm text-gray-500 mt-1">{pkg.credits} credits</p>
          </div>

          <p className="text-sm text-gray-600 flex-1">{pkg.description}</p>

          <button
            onClick={() => handleBuy(pkg)}
            disabled={pending}
            className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {pending ? 'Redirecting…' : 'Buy'}
          </button>
        </div>
      ))}
    </div>
  )
}
