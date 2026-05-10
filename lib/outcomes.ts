export interface Outcome {
  id: string
  name: string
  description: string
  credits: number
  intro: string
}

export const OUTCOMES: Outcome[] = [
  {
    id: 'carrier-performance',
    name: "Who's Actually Delivering For You",
    description: 'See which carriers are handling the most — and costing the most.',
    credits: 1,
    intro: "Here's how your carriers stack up by shipment volume. This tells you who's doing the most work — and whether your spend matches it.",
  },
  {
    id: 'duplicate-charges',
    name: 'Orders You Paid For Twice',
    description: 'Catch orders you may have been billed for more than once.',
    credits: 3,
    intro: "Ani flagged some orders that appear to have been charged more than once. These are worth a second look — they may be billing errors you can dispute.",
  },
  {
    id: 'budget-breakdown',
    name: 'Where Your Shipping Budget Went',
    description: 'Get a clear picture of where every shipping dollar is going.',
    credits: 2,
    intro: "Here's the full picture of where your shipping spend went. Use this to spot which carriers are costing the most relative to the work they're doing.",
  },
  {
    id: 'margin-erosion',
    name: "What's Quietly Eating Your Margin",
    description: 'Find out if your heavier or oddly-sized shipments are quietly eating your margins.',
    credits: 3,
    intro: "This one looks at whether heavier or unusual shipments are costing you more than they should. Outliers here can quietly chip away at your margins over time.",
  },
  {
    id: 'carrier-variance',
    name: 'The Rate Gap Nobody Told You About',
    description: 'See how consistent (or inconsistent) your carrier pricing really is.',
    credits: 2,
    intro: "Consistent pricing from your carriers means predictable costs. Big swings in what you're charged for similar shipments can signal negotiation opportunities — or billing problems.",
  },
  {
    id: 'packaging-variance',
    name: "What Your Packaging Is Actually Costing You",
    description: 'Understand how shipping cost changes across different weight ranges.',
    credits: 2,
    intro: "Ani broke your shipments into weight buckets to see if you're paying proportionally for what you're sending. Surprises here can point to packaging inefficiencies or carrier pricing quirks.",
  },
  {
    id: 'fulfillment-integrity',
    name: "Shipments That Don't Match Your Orders",
    description: 'Spot tracking gaps and data issues before they become customer problems.',
    credits: 3,
    intro: "This is your data health check. Missing tracking numbers and duplicate tracking links can cause customer service headaches and make it hard to dispute carrier claims.",
  },
  {
    id: 'return-pressure',
    name: "What's Coming Back and Why",
    description: 'Find out how many orders required more than one shipment — and which carriers drive it.',
    credits: 2,
    intro: "Multi-shipment orders — where the same order needed more than one shipment — can indicate fulfillment issues, damaged goods, or carrier problems. Here's how yours breaks down.",
  },
]
