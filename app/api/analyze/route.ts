import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as adminClient } from '@supabase/supabase-js'
import { OUTCOMES } from '@/lib/outcomes'

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

  // Deduct credits atomically
  const { data: success } = await db.rpc('deduct_credits', {
    p_user_id: user.id,
    p_amount: totalCredits,
  })

  if (!success) {
    return NextResponse.json({ error: 'Not enough credits.' }, { status: 402 })
  }

  // Log the transaction
  await db.from('credit_transactions').insert({
    user_id: user.id,
    amount: -totalCredits,
    reason: `analysis:${outcomeIds.join(',')}`,
  })

  // Create report record — analysis runs in Phase 3
  const { data: report, error: reportError } = await db
    .from('reports')
    .insert({
      user_id: user.id,
      outcome_ids: outcomeIds,
      vendor: 'unknown',
      column_map: columnMap,
      credits_used: totalCredits,
      status: 'pending',
    })
    .select('id')
    .single()

  if (reportError || !report) {
    return NextResponse.json({ error: 'Failed to create report.' }, { status: 500 })
  }

  return NextResponse.json({ reportId: report.id })
}
