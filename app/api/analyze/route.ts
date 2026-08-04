import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as adminClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import { OUTCOMES } from '@/lib/outcomes'
import { runAnalysis, extractRows } from '@/lib/analyzers'
import { isPromoActive } from '@/lib/promo'

function admin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const outcomeIds = formData.getAll('outcomeIds') as string[]
  const columnMapRaw = (formData.get('columnMap') as string) || '{}'

  if (outcomeIds.length === 0) {
    return NextResponse.json({ error: 'No outcomes selected.' }, { status: 400 })
  }

  let columnMap: Record<string, string>
  try {
    columnMap = JSON.parse(columnMapRaw)
  } catch {
    return NextResponse.json({ error: 'Invalid column mapping.' }, { status: 400 })
  }

  const selectedOutcomes = OUTCOMES.filter((o) => outcomeIds.includes(o.id))
  const totalCredits = selectedOutcomes.reduce((sum, o) => sum + o.credits, 0)

  const db = admin()

  // First-analysis-free promo: waive the cost if this account has never run a
  // report before and the promo window is still open. Re-checked here server-side
  // regardless of what the client believed, since this is what actually charges credits.
  let isFreeTrialRun = false
  if (isPromoActive()) {
    const { count: priorReports } = await db
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    isFreeTrialRun = (priorReports ?? 0) === 0
  }

  if (isFreeTrialRun) {
    await db.from('credit_transactions').insert({
      user_id: user.id,
      amount: 0,
      reason: `promo:first_free:${outcomeIds.join(',')}`,
    })
  } else {
    // Deduct credits atomically
    const { data: success } = await db.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: totalCredits,
    })

    if (!success) {
      return NextResponse.json({ error: 'Not enough credits.' }, { status: 402 })
    }

    await db.from('credit_transactions').insert({
      user_id: user.id,
      amount: -totalCredits,
      reason: `analysis:${outcomeIds.join(',')}`,
    })
  }

  // Create report row
  const { data: report, error: reportError } = await db
    .from('reports')
    .insert({
      user_id: user.id,
      outcome_ids: outcomeIds,
      vendor: 'unknown',
      credits_used: isFreeTrialRun ? 0 : totalCredits,
      status: 'pending',
    })
    .select('id')
    .single()

  if (reportError || !report) {
    return NextResponse.json({ error: 'Failed to create report.' }, { status: 500 })
  }

  // Run analysis synchronously
  try {
    if (!file) throw new Error('No file provided')

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 })
    const rows = extractRows(rawRows, columnMap)
    const results = outcomeIds.map(id => runAnalysis(id, rows))

    await db
      .from('reports')
      .update({ result_json: results, status: 'complete' })
      .eq('id', report.id)
  } catch (err) {
    console.error('Analysis failed:', err)
    await db
      .from('reports')
      .update({ status: 'error' })
      .eq('id', report.id)
  }

  return NextResponse.json({ reportId: report.id })
}
