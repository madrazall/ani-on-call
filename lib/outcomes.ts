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
  {
    id: 'weight-bracket-creep',
    name: 'Packages Tipping Into a Pricier Bracket',
    description: 'Find shipments landing just over a weight line — and what that crept into.',
    credits: 2,
    intro: "Carriers price in brackets, so a package that's a hair over a line can jump to a whole new rate. Here's where your shipments are sitting right at that edge, and what it's costing you compared to just under it.",
  },
  {
    id: 'service-level-overspend',
    name: "Paying For Speed You Didn't Need",
    description: 'See if premium service levels are costing you more than a comparable weight really needs.',
    credits: 3,
    intro: "Ani compared what similar-weight packages cost across your different service levels. If a pricier speed crept in where a cheaper one would've done the job just as well, here's where.",
  },
  {
    id: 'reship-root-cause',
    name: 'Why Orders Keep Coming Back For a Second Shipment',
    description: 'Find out if re-ships cluster around a specific carrier or weight class instead of just counting them.',
    credits: 3,
    intro: "Multiple shipments on one order usually means something's going wrong upstream. Ani checked whether it's landing on a specific carrier or a specific weight class more than random chance would explain.",
  },
  {
    id: 'cost-creep-over-time',
    name: 'Is Shipping Quietly Getting More Expensive',
    description: 'Track your average cost per shipment month over month to catch rate creep before it adds up.',
    credits: 2,
    intro: "Rates rarely jump all at once — they creep. Here's how your average cost per shipment has moved over the time range in this file.",
  },
]
