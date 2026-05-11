import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

function adminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  const { code } = await req.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = adminClient()

  // Look up the promo code
  const { data: promo } = await admin
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .maybeSingle()

  if (!promo) {
    return NextResponse.json({ error: 'Invalid or expired promo code' }, { status: 400 })
  }

  // Check max uses
  if (promo.max_uses !== null && promo.uses >= promo.max_uses) {
    return NextResponse.json({ error: 'This promo code has reached its limit' }, { status: 400 })
  }

  // Check if user already used this code
  const { data: existingUse } = await admin
    .from('promo_code_uses')
    .select('id')
    .eq('user_id', user.id)
    .eq('promo_code_id', promo.id)
    .maybeSingle()

  if (existingUse) {
    return NextResponse.json({ error: "You've already used this promo code" }, { status: 400 })
  }

  // Record the use
  const { error: useError } = await admin.from('promo_code_uses').insert({
    user_id: user.id,
    promo_code_id: promo.id,
  })

  if (useError) {
    return NextResponse.json({ error: 'Failed to redeem promo code' }, { status: 500 })
  }

  // Increment use count
  await admin
    .from('promo_codes')
    .update({ uses: promo.uses + 1 })
    .eq('id', promo.id)

  // Award credits
  const { error: creditError } = await admin.rpc('increment_credits', {
    p_user_id: user.id,
    p_amount: promo.credits,
  })

  if (creditError) {
    return NextResponse.json({ error: 'Credits could not be added' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    credits_awarded: promo.credits,
    message: `${promo.credits} credits added to your account`,
  })
}
