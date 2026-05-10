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
    credits: 3,
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
  {
    id: 'carrier-variance',
    name: 'The Rate Gap Nobody Told You About',
    description: 'Cost variance across carriers and services for similar shipments.',
    credits: 2,
  },
  {
    id: 'packaging-variance',
    name: "What Your Packaging Is Actually Costing You",
    description: 'Cost variation within a single carrier by package dimensions and weight.',
    credits: 2,
  },
  {
    id: 'fulfillment-integrity',
    name: "Shipments That Don't Match Your Orders",
    description: 'Cross-references shipment records against order data to surface fulfillment gaps.',
    credits: 3,
  },
  {
    id: 'return-pressure',
    name: "What's Coming Back and Why",
    description: 'Return rate analysis by carrier, service type, and timeframe.',
    credits: 2,
  },
]
