export interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  description: string
  popular?: boolean
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 5,
    price: 500,
    description: 'Good for a quick one-time check.',
  },
  {
    id: 'standard',
    name: 'Standard',
    credits: 15,
    price: 1200,
    description: "Great if you're doing a full audit or plan to run a few reports.",
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 50,
    price: 3500,
    description: 'For power users who want to dig deep or run reports regularly.',
  },
]
