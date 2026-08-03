import type { IntakeTree } from './types'

export const shippingTree: IntakeTree = {
  domain: 'shipping',
  categories: [
    {
      id: 'losing-money',
      label: 'Losing Money',
      tagline: "Something feels off with what you're spending",
      questions: [
        {
          type: 'binary',
          id: 'multi-service',
          text: 'Do you ship using more than one speed or service level, like Ground and 2-Day?',
          stateKey: 'uses_multiple_service_levels',
        },
        {
          type: 'binary',
          id: 'free-shipping',
          text: 'Do you offer free shipping to your customers?',
          stateKey: 'free_shipping',
        },
        {
          type: 'binary',
          id: 'knows-avg-cost',
          text: 'Do you know your average shipping cost per order?',
          stateKey: 'knows_avg_shipping_cost',
        },
      ],
      routes: [
        {
          when: (a) => a.uses_multiple_service_levels === true,
          outcomeId: 'service-level-overspend',
        },
        {
          when: (a) => a.free_shipping === true && a.knows_avg_shipping_cost === false,
          outcomeId: 'margin-erosion',
        },
        {
          when: (a) => a.free_shipping === false && a.knows_avg_shipping_cost === true,
          outcomeId: 'duplicate-charges',
        },
      ],
      fallback: 'budget-breakdown',
    },
    {
      id: 'unpredictable-costs',
      label: 'Unpredictable Costs',
      tagline: "Your shipping bills don't make sense month to month",
      questions: [
        {
          type: 'binary',
          id: 'cost-trend',
          text: 'Has your average shipping cost been creeping up over the last few months?',
          stateKey: 'costs_trending_up',
        },
        {
          type: 'binary',
          id: 'weight-jump',
          text: 'Do costs sometimes jump sharply right around a certain weight, like just over a pound or five pounds?',
          stateKey: 'cost_jumps_at_weight',
        },
        {
          type: 'binary',
          id: 'package-variance',
          text: 'Do similar packages sometimes cost very different amounts to ship?',
          stateKey: 'similar_packages_vary_cost',
        },
        {
          type: 'binary',
          id: 'multiple-carriers',
          text: 'Do you use more than one carrier or shipping service?',
          stateKey: 'multiple_carriers',
        },
      ],
      routes: [
        {
          when: (a) => a.costs_trending_up === true,
          outcomeId: 'cost-creep-over-time',
        },
        {
          when: (a) => a.cost_jumps_at_weight === true,
          outcomeId: 'weight-bracket-creep',
        },
        {
          when: (a) => a.similar_packages_vary_cost === true && a.multiple_carriers === true,
          outcomeId: 'carrier-variance',
        },
        {
          when: (a) => a.similar_packages_vary_cost === true && a.multiple_carriers === false,
          outcomeId: 'packaging-variance',
        },
      ],
      fallback: 'budget-breakdown',
    },
    {
      id: 'operational-issues',
      label: 'Operational Issues',
      tagline: 'Something in the process keeps going wrong',
      questions: [
        {
          type: 'select',
          id: 'ops-problem',
          text: "What's going wrong most often?",
          stateKey: 'ops_problem',
          options: [
            { label: 'Late deliveries', value: 'late_delivery' },
            { label: 'Damaged shipments', value: 'damage_in_transit' },
            { label: 'Wrong items sent', value: 'wrong_item' },
            { label: 'High return rates', value: 'returns' },
          ],
        },
        {
          type: 'binary',
          id: 'carrier-pattern',
          text: 'Do these issues tend to cluster around a specific carrier?',
          stateKey: 'issues_cluster_by_carrier',
        },
      ],
      routes: [
        {
          when: (a) => a.ops_problem === 'returns' && a.issues_cluster_by_carrier === true,
          outcomeId: 'reship-root-cause',
        },
        {
          when: (a) => a.ops_problem === 'late_delivery' || a.ops_problem === 'damage_in_transit',
          outcomeId: 'carrier-performance',
        },
        {
          when: (a) => a.ops_problem === 'wrong_item',
          outcomeId: 'fulfillment-integrity',
        },
        {
          when: (a) => a.ops_problem === 'returns',
          outcomeId: 'return-pressure',
        },
      ],
      fallback: 'carrier-performance',
    },
  ],
}
