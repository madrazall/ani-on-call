import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@supabase/supabase-js'
import { sendFeedbackConfirmationEmail } from '@/lib/email'

function adminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  const body = await req.json()

  if (!body.email || !body.type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = adminClient()

  // One credit award per email — check if this email already got credits
  const { data: existing } = await supabase
    .from('feedback')
    .select('id')
    .eq('email', body.email)
    .eq('credits_awarded', true)
    .maybeSingle()

  if (existing) {
    await supabase.from('feedback').insert({
      type: body.type,
      email: body.email,
      name: body.name || null,
      rating: body.rating || null,
      review_text: body.review_text || null,
      suggestion_type: body.suggestion_type || null,
      suggestion_text: body.suggestion_text || null,
      platforms: body.platforms || [],
      credits_awarded: false,
    })
    return NextResponse.json({ success: true, credits_awarded: false })
  }

  // Save the submission
  const { data: feedback, error } = await supabase
    .from('feedback')
    .insert({
      type: body.type,
      email: body.email,
      name: body.name || null,
      rating: body.rating || null,
      review_text: body.review_text || null,
      suggestion_type: body.suggestion_type || null,
      suggestion_text: body.suggestion_text || null,
      platforms: body.platforms || [],
      credits_awarded: false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }

  // Look up the user by email to award credits
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const user = users.find(u => u.email === body.email)

  if (user) {
    const { error: creditError } = await supabase.rpc('increment_credits', {
      p_user_id: user.id,
      p_amount: 3,
    })

    if (!creditError) {
      await supabase
        .from('feedback')
        .update({
          credits_awarded: true,
          credits_awarded_at: new Date().toISOString(),
        })
        .eq('id', feedback.id)
    }
  }

  await sendFeedbackConfirmationEmail(body.email, body.name)

  return NextResponse.json({ success: true, credits_awarded: !!user })
}
