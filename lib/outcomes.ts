export interface Outcome {
  id: string
  name: string
  description: string
  credits: number
}

export const OUTCOMES: Outcome[] = [
  {
    id: 'carrier-performance',
    name: "Who's Actually Delivering For You",
    description: 'Carrier frequency and on-time rate breakdown.',
    credits: 1,
  },
  {
    id: 'duplicate-charges',
    name: 'Orders You Paid For Twice',
    description: 'Detects duplicate shipments by order ID and tracking number.',
    credits: 2,
  },
  {
    id: 'budget-breakdown',
    name: 'Where Your Shipping Budget Went',
    description: 'Cost breakdown by carrier, service, and date range.',
    credits: 2,
  },
  {
    id: 'margin-erosion',
    name: "What's Quietly Eating Your Margin",
    description: 'High cost-per-weight shipments and unusual surcharges.',
    credits: 3,
  },
]
