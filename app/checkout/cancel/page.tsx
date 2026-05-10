import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-mono text-2xl font-bold text-ani-white mb-3">No worries.</h1>
        <p className="text-sm text-ani-muted mb-8 leading-relaxed">
          You weren&apos;t charged. Whenever you&apos;re ready, your credits are waiting.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/buy"
            className="inline-block bg-ani-copper text-ani-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Back to credits
          </Link>
          <Link
            href="/"
            className="text-sm text-ani-muted hover:text-ani-white transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
