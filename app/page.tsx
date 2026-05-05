import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24">
      <h1 className="text-4xl font-semibold text-gray-900 mb-4 leading-tight">
        Something feel off with your shipping costs?
      </h1>
      <p className="text-lg text-gray-500 mb-10">
        Upload your export, pick what you want to know, and get a plain-English answer.
        Could be a real problem. Could be nothing. Either way, now you know.
      </p>
      <div className="flex gap-3">
        <Link
          href="/sign-up"
          className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Get started
        </Link>
        <Link
          href="/buy"
          className="text-gray-900 px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-200 hover:border-gray-400 transition-colors"
        >
          See pricing
        </Link>
      </div>
    </div>
  )
}
