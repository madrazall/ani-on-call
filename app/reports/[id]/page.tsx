import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OUTCOMES } from '@/lib/outcomes'
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          {report.vendor !== 'unknown' ? report.vendor : 'Unknown format'}
        </p>
        <h1 className="text-2xl font-semibold text-gray-900">Your report</h1>
      </div>

      <div className="space-y-4">
        {outcomes.map((outcome) => (
          <div key={outcome.id} className="border border-gray-200 rounded-xl p-5">
            <p className="text-sm font-medium text-gray-900 mb-1">{outcome.name}</p>
            <p className="text-sm text-gray-400 italic">
              Analysis coming in Phase 3.
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-4 text-sm text-gray-400">
        <span>{report.credits_used} {report.credits_used === 1 ? 'credit' : 'credits'} used</span>
        <span>·</span>
        <Link href="/upload" className="hover:text-gray-900 transition-colors">
          Run another analysis
        </Link>
      </div>
    </div>
  )
}
