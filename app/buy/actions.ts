'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { CREDIT_PACKAGES } from '@/lib/packages'
import { redirect } from 'next/navigation'

export async function createCheckoutSession(packageId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId)

  if (!pkg) {
    throw new Error('Invalid package')
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
      credits: String(pkg.credits),
    },
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel`,
    customer_email: user.email,
    allow_promotion_codes: true,
  })

  redirect(session.url!)
}
