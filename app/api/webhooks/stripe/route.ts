import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient as createServerClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Uses service role — bypasses RLS for webhook writes
function adminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { user_id, credits } = session.metadata ?? {}

    if (!user_id || !credits) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const creditAmount = parseInt(credits, 10)
    const supabase = adminClient()

    // Idempotency check — skip if this session was already processed
    const { data: existing } = await supabase
      .from('credit_transactions')
      .select('id')
      .eq('stripe_session_id', session.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ received: true })
    }

    // Credit the balance
    const { error: balanceError } = await supabase.rpc('increment_credits', {
      p_user_id: user_id,
      p_amount: creditAmount,
    })

    if (balanceError) {
      console.error('Failed to increment credits:', balanceError)
      return NextResponse.json({ error: 'Credit update failed' }, { status: 500 })
    }

    // Log the transaction
    await supabase.from('credit_transactions').insert({
      user_id,
      amount: creditAmount,
      reason: 'purchase',
      stripe_session_id: session.id,
    })
  }

  return NextResponse.json({ received: true })
}
