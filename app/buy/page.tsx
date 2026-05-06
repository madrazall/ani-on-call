import { CREDIT_PACKAGES } from '@/lib/packages'
import { createCheckoutSession } from './actions'
import BuyButtons from './buy-buttons'

export default function BuyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold text-gray-900 mb-2">Get credits</h1>
      <p className="text-gray-500 mb-12">
        Credits are used when you run an analysis. You only pay for what you run.
      </p>

      <BuyButtons packages={CREDIT_PACKAGES} action={createCheckoutSession} />

      <p className="text-xs text-gray-400 mt-8">
        Credits don&apos;t expire. No subscription. No refunds if a report runs clean.
      </p>
    </div>
  )
}
