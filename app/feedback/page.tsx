'use client'

import { useState } from 'react'

const PLATFORMS = ['ShipStation', 'Pirateship', 'EasyPost', 'ShipBob', 'Shopify', 'WooCommerce', 'Other']

const SUGGESTION_TYPES = [
  { value: 'feature', label: 'New feature' },
  { value: 'platform', label: 'Platform support' },
  { value: 'analyzer', label: 'New analysis type' },
  { value: 'other', label: 'Something else' },
]

type Tab = 'review' | 'suggestion'

export default function FeedbackPage() {
  const [tab, setTab] = useState<Tab>('review')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [suggestionType, setSuggestionType] = useState('')
  const [suggestionText, setSuggestionText] = useState('')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [creditsAwarded, setCreditsAwarded] = useState(false)

  function togglePlatform(p: string) {
    setPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const body = {
      type: tab,
      email,
      name: name || null,
      rating: tab === 'review' ? rating || null : null,
      review_text: tab === 'review' ? reviewText || null : null,
      suggestion_type: tab === 'suggestion' ? suggestionType || null : null,
      suggestion_text: tab === 'suggestion' ? suggestionText || null : null,
      platforms,
    }

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Try again.')
        setLoading(false)
        return
      }

      setCreditsAwarded(data.credits_awarded)
      setDone(true)
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-ani-surface border border-ani-border mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-ani-copper" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="font-mono text-2xl font-bold text-ani-white mb-3">Got it. Thanks.</h1>
          <p className="text-sm text-ani-muted leading-relaxed">
            {creditsAwarded
              ? 'We read every submission personally. Your 3 free credits have been added — head back whenever you\'re ready to run another analysis.'
              : 'We read every submission personally. If you submitted a suggestion, we use these to decide what to build next.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        <div className="mb-10">
          <p className="text-xs font-mono text-ani-copper uppercase tracking-widest mb-4">
            Ani On Call
          </p>
          <h1 className="font-mono text-2xl font-bold text-ani-white mb-1">Tell us what you think.</h1>
          <p className="text-sm text-ani-muted">
            Leave a review or drop a suggestion. Either way, you&apos;ll get 3 free credits for your time.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border border-ani-border rounded-lg p-1 bg-ani-surface">
          <button
            type="button"
            onClick={() => setTab('review')}
            className={`flex-1 py-2 text-sm font-mono font-medium rounded-md transition-colors ${
              tab === 'review'
                ? 'bg-ani-copper text-ani-white'
                : 'text-ani-muted hover:text-ani-white'
            }`}
          >
            Leave a review
          </button>
          <button
            type="button"
            onClick={() => setTab('suggestion')}
            className={`flex-1 py-2 text-sm font-mono font-medium rounded-md transition-colors ${
              tab === 'suggestion'
                ? 'bg-ani-copper text-ani-white'
                : 'text-ani-muted hover:text-ani-white'
            }`}
          >
            Send a suggestion
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-ani-muted mb-1.5 uppercase tracking-wide">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2.5 border border-ani-border rounded-lg text-sm bg-ani-surface text-ani-white placeholder:text-ani-muted focus:outline-none focus:ring-2 focus:ring-ani-copper focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-ani-muted mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 border border-ani-border rounded-lg text-sm bg-ani-surface text-ani-white placeholder:text-ani-muted focus:outline-none focus:ring-2 focus:ring-ani-copper focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {tab === 'review' && (
            <>
              <div>
                <label className="block text-xs font-mono font-medium text-ani-muted mb-2 uppercase tracking-wide">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={`w-10 h-10 rounded-lg border text-sm font-mono font-medium transition-colors ${
                        rating >= n
                          ? 'bg-ani-copper text-ani-white border-ani-copper'
                          : 'border-ani-border text-ani-muted hover:border-ani-muted'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono font-medium text-ani-muted mb-1.5 uppercase tracking-wide">
                  Your review
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="What did Ani find? What surprised you?"
                  className="w-full px-3 py-2.5 border border-ani-border rounded-lg text-sm bg-ani-surface text-ani-white placeholder:text-ani-muted focus:outline-none focus:ring-2 focus:ring-ani-copper focus:border-transparent transition-colors resize-none"
                />
              </div>
            </>
          )}

          {tab === 'suggestion' && (
            <>
              <div>
                <label className="block text-xs font-mono font-medium text-ani-muted mb-1.5 uppercase tracking-wide">
                  Type
                </label>
                <select
                  required
                  value={suggestionType}
                  onChange={e => setSuggestionType(e.target.value)}
                  className="w-full px-3 py-2.5 border border-ani-border rounded-lg text-sm bg-ani-surface text-ani-white focus:outline-none focus:ring-2 focus:ring-ani-copper focus:border-transparent transition-colors"
                >
                  <option value="" disabled>Select one</option>
                  {SUGGESTION_TYPES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono font-medium text-ani-muted mb-1.5 uppercase tracking-wide">
                  Tell us more
                </label>
                <textarea
                  required
                  rows={4}
                  value={suggestionText}
                  onChange={e => setSuggestionText(e.target.value)}
                  placeholder="What would make Ani more useful for you?"
                  className="w-full px-3 py-2.5 border border-ani-border rounded-lg text-sm bg-ani-surface text-ani-white placeholder:text-ani-muted focus:outline-none focus:ring-2 focus:ring-ani-copper focus:border-transparent transition-colors resize-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-mono font-medium text-ani-muted mb-2 uppercase tracking-wide">
              Platforms you use
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                    platforms.includes(p)
                      ? 'bg-ani-copper text-ani-white border-ani-copper'
                      : 'border-ani-border text-ani-muted hover:border-ani-muted'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-ani-red bg-ani-red-dim px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ani-copper text-ani-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Submitting…' : 'Submit and get 3 free credits'}
          </button>

          <p className="text-xs text-ani-muted text-center">
            One credit award per email address.
          </p>
        </form>
      </div>
    </div>
  )
}
