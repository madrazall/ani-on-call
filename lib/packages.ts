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
    description: 'Perfect for trying it out. Covers 2–3 analyses.',
  },
  {
    id: 'standard',
    name: 'Standard',
    credits: 15,
    price: 1200,
    description: 'Best value for regular check-ins. Covers 5–7 analyses.',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 50,
    price: 3500,
    description: 'For teams that audit monthly. Covers 15+ analyses.',
  },
]
