import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, CREDIT_PACKAGES } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { packageId } = await request.json()
  const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId)

  if (!pkg) {
    return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: pkg.price,
          product_data: {
            name: `${pkg.name} — ${pkg.credits} credits`,
            description: pkg.description,
          },
        },
      },
    ],
    metadata: {
      user_id: user.id,
      package_id: pkg.id,
      credits: pkg.credits,
    },
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel`,
    customer_email: user.email,
  })

  return NextResponse.json({ url: session.url })
}
