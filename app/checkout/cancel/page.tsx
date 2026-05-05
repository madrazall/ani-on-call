import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">No worries.</h1>
        <p className="text-sm text-gray-500 mb-8">
          You weren&apos;t charged. Head back whenever you&apos;re ready.
        </p>
        <Link
          href="/buy"
          className="inline-block bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Back to credits
        </Link>
      </div>
    </div>
  )
}
