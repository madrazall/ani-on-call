import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OUTCOMES } from '@/lib/outcomes'
import type { AnalysisResult } from '@/lib/analyzers'
import Link from 'next/link'

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!report) notFound()

  const outcomes = OUTCOMES.filter((o) => report.outcome_ids.includes(o.id))
  const results: AnalysisResult[] = Array.isArray(report.result_json) ? report.result_json : []

  // ── Error state ──────────────────────────────────────────────────────
  if (report.status === 'error') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="border border-ani-border bg-ani-red-dim rounded-xl p-6 mb-8">
          <p className="font-mono text-sm font-medium text-ani-red mb-1">Analysis failed</p>
          <p className="text-sm text-ani-muted">
            Something went wrong while processing your file. Your credits have not been
            refunded automatically — reach out and we&apos;ll sort it out.
          </p>
        </div>
        <Link href="/upload" className="text-sm text-ani-copper hover:opacity-80 transition-opacity">
          ← Try again
        </Link>
      </div>
    )
  }

  // ── Pending state ────────────────────────────────────────────────────
  if (report.status === 'pending' || results.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-ani-copper animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-ani-copper animate-pulse [animation-delay:150ms]" />
          <div className="w-1.5 h-1.5 rounded-full bg-ani-copper animate-pulse [animation-delay:300ms]" />
        </div>
        <p className="font-mono text-lg text-ani-white">Ani&apos;s on it.</p>
        <p className="text-sm text-ani-muted mt-2">Running your analysis…</p>
      </div>
    )
  }

  // ── Results ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="text-xs font-mono text-ani-muted mb-1">
          {report.credits_used} {report.credits_used === 1 ? 'credit' : 'credits'} used
        </p>
        <h1 className="font-mono text-2xl font-bold text-ani-white">Your results</h1>
      </div>

      <div className="space-y-6">
        {results.map((result) => {
          const outcome = outcomes.find((o) => o.id === result.outcomeId)
          return (
            <div key={result.outcomeId} className="border border-ani-border bg-ani-surface rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-ani-border">
                <p className="text-xs font-mono text-ani-muted mb-1">{outcome?.name ?? result.outcomeId}</p>
                <p className="text-sm text-ani-white leading-relaxed">{result.summary}</p>
              </div>

              {result.findings.length > 0 && (
                <div className="divide-y divide-ani-border">
                  {result.findings.map((finding, i) => (
                    <div key={i} className="flex justify-between items-center px-5 py-3 gap-4">
                      <span className="text-xs text-ani-muted">{finding.label}</span>
                      <span className={`text-xs font-mono text-right ${
                        finding.highlight ? 'text-ani-copper font-medium' : 'text-ani-white'
                      }`}>
                        {finding.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-10 pt-8 border-t border-ani-border flex items-center justify-between">
        <Link
          href="/upload"
          className="text-sm text-ani-copper hover:opacity-80 transition-opacity"
        >
          Run another analysis →
        </Link>
        <span className="text-xs text-ani-muted font-mono">
          {new Date(report.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })}
        </span>
      </div>
    </div>
  )
}
