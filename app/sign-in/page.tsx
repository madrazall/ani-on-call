'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    window.location.href = '/upload'
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="mb-10">
          <p className="text-xs font-mono text-ani-copper uppercase tracking-widest mb-4">
            Ani On Call
          </p>
          <h1 className="font-mono text-2xl font-bold text-ani-white mb-1">Welcome back.</h1>
          <p className="text-sm text-ani-muted">
            Ani&apos;s got your data whenever you&apos;re ready.{' '}
            <Link href="/sign-up" className="text-ani-copper hover:opacity-80 transition-opacity">
              New here?
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-ani-border rounded-lg text-sm bg-ani-surface text-ani-white focus:outline-none focus:ring-2 focus:ring-ani-copper focus:border-transparent transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-ani-red bg-ani-red-dim px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ani-copper text-ani-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
