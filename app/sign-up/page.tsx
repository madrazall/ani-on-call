'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-ani-surface border border-ani-border mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-ani-copper" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="font-mono text-2xl font-bold text-ani-white mb-3">Check your email</h1>
          <p className="text-sm text-ani-muted leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="font-medium text-ani-white">{email}</span>.
            Click it and Ani will be waiting.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="mb-10">
          <p className="text-xs font-mono text-ani-copper uppercase tracking-widest mb-4">
            Ani On Call
          </p>
          <h1 className="font-mono text-2xl font-bold text-ani-white mb-1">Let&apos;s get you set up.</h1>
          <p className="text-sm text-ani-muted">
            Ani&apos;s looked at a lot of shipping data. Yours is next.{' '}
            <Link href="/sign-in" className="text-ani-copper hover:opacity-80 transition-opacity">
              Already have an account?
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-mono font-medium text-ani-muted mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-ani-border rounded-lg text-sm bg-ani-surface text-ani-white placeholder:text-ani-muted focus:outline-none focus:ring-2 focus:ring-ani-copper focus:border-transparent transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-mono font-medium text-ani-muted mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-ani-border rounded-lg text-sm bg-ani-surface text-ani-white focus:outline-none focus:ring-2 focus:ring-ani-copper focus:border-transparent transition-colors"
            />
            <p className="text-xs text-ani-muted mt-1.5">At least 8 characters</p>
          </div>

          {error && (
            <p className="text-sm text-ani-red bg-ani-red-dim px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ani-copper text-ani-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  )
}
