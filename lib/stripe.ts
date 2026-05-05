import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export const CREDIT_PACKAGES = [
  {
    id: 'just-looking',
    name: 'Just Looking',
    credits: 3,
    price: 700,
    displayPrice: '$7',
    description: 'Enough to run one quick check.',
  },
  {
    id: 'got-a-hunch',
    name: 'Got a Hunch',
    credits: 8,
    price: 1500,
    displayPrice: '$15',
    description: 'Run a couple outcomes and see what turns up.',
  },
  {
    id: 'lets-fix-it',
    name: "Let's Fix It",
    credits: 20,
    price: 3200,
    displayPrice: '$32',
    description: 'Full picture. Worth it if something feels off.',
  },
] as const

export type CreditPackage = (typeof CREDIT_PACKAGES)[number]
