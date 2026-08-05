export type ConceptId =
  | 'carrier'
  | 'ship_date'
  | 'order_id'
  | 'tracking_number'
  | 'ship_cost'
  | 'service'
  | 'weight'

export interface Concept {
  id: ConceptId
  label: string
  description: string
}

export interface DetectionResult {
  concept: ConceptId
  column: string
  confidence: 'high' | 'low'
}

export type ColumnMap = Partial<Record<ConceptId, string>>

export const CONCEPTS: Record<ConceptId, Concept> = {
  carrier: {
    id: 'carrier',
    label: 'Carrier',
    description: 'Which column names the shipping carrier? (e.g. UPS, FedEx, USPS)',
  },
  ship_date: {
    id: 'ship_date',
    label: 'Ship Date',
    description: 'When did the shipment go out?',
  },
  order_id: {
    id: 'order_id',
    label: 'Order ID',
    description: 'Your internal order reference number.',
  },
  tracking_number: {
    id: 'tracking_number',
    label: 'Tracking Number',
    description: "The carrier's tracking number for each shipment.",
  },
  ship_cost: {
    id: 'ship_cost',
    label: 'Shipping Cost',
    description: 'The actual dollar amount charged per shipment.',
  },
  service: {
    id: 'service',
    label: 'Service Level',
    description: 'The service level used — like Ground, Priority, 2-Day.',
  },
  weight: {
    id: 'weight',
    label: 'Weight',
    description: 'Package weight, usually in lbs or oz.',
  },
}

// Which concepts each outcome needs
export const OUTCOME_CONCEPTS: Record<string, ConceptId[]> = {
  'carrier-performance':    ['carrier', 'ship_date', 'ship_cost'],
  'duplicate-charges':      ['order_id', 'tracking_number', 'ship_cost'],
  'budget-breakdown':       ['carrier', 'ship_cost', 'ship_date'],
  'margin-erosion':         ['carrier', 'service', 'weight', 'ship_cost'],
  'carrier-variance':       ['carrier', 'service', 'ship_cost'],
  'packaging-variance':     ['carrier', 'weight', 'ship_cost'],
  'fulfillment-integrity':  ['order_id', 'tracking_number', 'carrier'],
  'return-pressure':        ['carrier', 'order_id', 'ship_date'],
  'weight-bracket-creep':   ['weight', 'ship_cost'],
  'service-level-overspend': ['service', 'weight', 'ship_cost'],
  'reship-root-cause':      ['order_id', 'carrier', 'weight'],
  'cost-creep-over-time':   ['ship_date', 'ship_cost'],
}

const ALIASES: Record<ConceptId, string[]> = {
  carrier: [
    'carrier', 'shipping carrier', 'ship via', 'carrier name', 'shipper',
    'shipping provider', 'mail class', 'courier', 'carrier_name',
    'shipping_carrier', 'shipped via', 'ship carrier',
  ],
  ship_date: [
    'ship date', 'shipped date', 'date shipped', 'fulfillment date',
    'dispatch date', 'ship_date', 'shipped_at', 'fulfilled_at',
    'shipped on', 'fulfillment_date', 'date fulfilled', 'delivery date',
  ],
  order_id: [
    'order id', 'order #', 'order number', 'order_id', 'order_number',
    'order no', 'reference', 'reference number', 'order ref', 'name',
    'po number', 'orderid', 'order num',
  ],
  tracking_number: [
    'tracking number', 'tracking #', 'tracking', 'tracking_number',
    'track number', 'tracking no', 'track#', 'trackingnumber',
    'tracking num', 'tracking id',
  ],
  ship_cost: [
    'ship cost', 'shipping cost', 'postage', 'rate', 'total cost',
    'cost', 'postage amount', 'label cost', 'price', 'shipping amount',
    'total charge', 'ship_cost', 'amount', 'shipping fee', 'freight cost',
    'shipment cost',
  ],
  service: [
    'service', 'service level', 'service type', 'mail class',
    'ship method', 'shipping method', 'shipping service', 'method',
    'service_level', 'service_type', 'shipping_method', 'ship_method',
    'delivery method', 'delivery service',
  ],
  weight: [
    'weight', 'weight (oz)', 'weight (lbs)', 'weight_oz', 'weight_lbs',
    'package weight', 'total weight', 'oz', 'lbs', 'weight oz',
    'weight lbs', 'pkg weight',
  ],
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
}

export function detectColumns(headers: string[]): Record<ConceptId, DetectionResult | null> {
  const normalizedHeaders = headers.map((h) => ({
    original: h,
    normalized: normalize(h),
  }))

  const result = {} as Record<ConceptId, DetectionResult | null>
  const usedColumns = new Set<string>()

  const conceptIds = Object.keys(ALIASES) as ConceptId[]

  // Score every header against every concept, then assign greedily by best score
  const scores: { concept: ConceptId; column: string; score: number; confidence: 'high' | 'low' }[] = []

  for (const conceptId of conceptIds) {
    const aliases = ALIASES[conceptId].map(normalize)

    for (const header of normalizedHeaders) {
      const h = header.normalized

      // Exact match
      if (aliases.includes(h)) {
        scores.push({ concept: conceptId, column: header.original, score: 3, confidence: 'high' })
        continue
      }

      // Header contains alias
      if (aliases.some((a) => h.includes(a) || a.includes(h))) {
        scores.push({ concept: conceptId, column: header.original, score: 2, confidence: 'high' })
        continue
      }

      // Word-level overlap
      const hWords = new Set(h.split(/\s+/))
      const aliasWords = new Set(aliases.flatMap((a) => a.split(/\s+/)))
      const overlap = [...hWords].filter((w) => aliasWords.has(w) && w.length > 2)
      if (overlap.length > 0) {
        scores.push({ concept: conceptId, column: header.original, score: 1, confidence: 'low' })
      }
    }
  }

  // Sort by score descending, assign best unique match per concept
  scores.sort((a, b) => b.score - a.score)

  for (const conceptId of conceptIds) {
    result[conceptId] = null
  }

  for (const match of scores) {
    if (result[match.concept] !== null) continue
    if (usedColumns.has(match.column)) continue
    result[match.concept] = {
      concept: match.concept,
      column: match.column,
      confidence: match.confidence,
    }
    usedColumns.add(match.column)
  }

  return result
}

export function getRequiredConcepts(outcomeIds: string[]): ConceptId[] {
  const needed = new Set<ConceptId>()
  for (const id of outcomeIds) {
    for (const concept of OUTCOME_CONCEPTS[id] ?? []) {
      needed.add(concept)
    }
  }
  return [...needed]
}
