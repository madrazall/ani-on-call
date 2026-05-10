export interface Finding {
  label: string
  value: string
  highlight?: boolean
}

export interface AnalysisResult {
  outcomeId: string
  summary: string
  findings: Finding[]
}

type Row = Record<string, string>

// ── Helpers ──────────────────────────────────────────────────────────

function parseCost(v: string): number {
  return parseFloat(v.replace(/[^0-9.-]/g, '')) || 0
}

function parseWeight(v: string): number {
  return parseFloat(v.replace(/[^0-9.-]/g, '')) || 0
}

function currency(n: number): string {
  return `$${n.toFixed(2)}`
}

function pct(n: number, total: number): string {
  return total > 0 ? `${((n / total) * 100).toFixed(1)}%` : '0%'
}

function groupBy(rows: Row[], key: keyof Row): Map<string, Row[]> {
  const map = new Map<string, Row[]>()
  for (const row of rows) {
    const k = (row[key] || '').trim()
    if (!k) continue
    if (!map.has(k)) map.set(k, [])
    map.get(k)!.push(row)
  }
  return map
}

// ── Carrier Performance ──────────────────────────────────────────────

function analyzeCarrierPerformance(rows: Row[]): AnalysisResult {
  const valid = rows.filter(r => r.carrier)
  if (valid.length === 0) {
    return { outcomeId: 'carrier-performance', summary: 'No carrier data found in this file.', findings: [] }
  }

  const groups = groupBy(valid, 'carrier')
  const total = valid.length
  const sorted = [...groups.entries()]
    .map(([carrier, rs]) => ({ carrier, count: rs.length }))
    .sort((a, b) => b.count - a.count)

  const top = sorted[0]
  const summary = sorted.length === 1
    ? `All ${total} shipments went through ${top.carrier}.`
    : `You've shipped with ${sorted.length} carriers. ${top.carrier} handles ${pct(top.count, total)} of your volume.`

  return {
    outcomeId: 'carrier-performance',
    summary,
    findings: sorted.map(({ carrier, count }) => ({
      label: carrier,
      value: `${count} shipments — ${pct(count, total)}`,
      highlight: carrier === top.carrier,
    })),
  }
}

// ── Duplicate Charges ────────────────────────────────────────────────

function analyzeDuplicateCharges(rows: Row[]): AnalysisResult {
  const byOrder = groupBy(rows.filter(r => r.order_id), 'order_id')
  const byTracking = groupBy(rows.filter(r => r.tracking_number), 'tracking_number')

  const dupOrders = [...byOrder.entries()].filter(([, v]) => v.length > 1)
  const dupTracking = [...byTracking.entries()].filter(([, v]) => v.length > 1)
  const total = dupOrders.length + dupTracking.length

  if (total === 0) {
    return {
      outcomeId: 'duplicate-charges',
      summary: 'No duplicate charges detected. Your billing looks clean.',
      findings: [{ label: 'Duplicates found', value: 'None' }],
    }
  }

  const summary = `Found ${total} potential duplicate ${total === 1 ? 'charge' : 'charges'} — ${dupOrders.length} by order ID, ${dupTracking.length} by tracking number.`

  return {
    outcomeId: 'duplicate-charges',
    summary,
    findings: [
      ...dupOrders.slice(0, 10).map(([id, rs]) => ({
        label: `Order ${id}`,
        value: `${rs.length} charges`,
        highlight: true,
      })),
      ...dupTracking.slice(0, 10).map(([tn, rs]) => ({
        label: `Tracking ${tn}`,
        value: `${rs.length} shipments`,
        highlight: true,
      })),
    ],
  }
}

// ── Budget Breakdown ─────────────────────────────────────────────────

function analyzeBudgetBreakdown(rows: Row[]): AnalysisResult {
  const valid = rows.filter(r => r.ship_cost)
  if (valid.length === 0) {
    return { outcomeId: 'budget-breakdown', summary: 'No shipping cost data found.', findings: [] }
  }

  const totalSpend = valid.reduce((sum, r) => sum + parseCost(r.ship_cost), 0)
  const byCarrier = groupBy(valid.filter(r => r.carrier), 'carrier')

  const carrierTotals = [...byCarrier.entries()]
    .map(([carrier, rs]) => ({
      carrier,
      total: rs.reduce((sum, r) => sum + parseCost(r.ship_cost), 0),
    }))
    .sort((a, b) => b.total - a.total)

  const top = carrierTotals[0]
  const summary = `Total shipping spend: ${currency(totalSpend)}. ${top ? `${top.carrier} is your biggest cost at ${currency(top.total)}.` : ''}`

  return {
    outcomeId: 'budget-breakdown',
    summary,
    findings: [
      { label: 'Total spend', value: currency(totalSpend), highlight: true },
      ...carrierTotals.map(({ carrier, total }) => ({
        label: carrier,
        value: `${currency(total)} — ${pct(total, totalSpend)}`,
      })),
    ],
  }
}

// ── Margin Erosion ───────────────────────────────────────────────────

function analyzeMarginErosion(rows: Row[]): AnalysisResult {
  const valid = rows.filter(r => r.ship_cost && r.weight)
  if (valid.length === 0) {
    return { outcomeId: 'margin-erosion', summary: 'Not enough data to analyze margin erosion.', findings: [] }
  }

  const withCPW = valid
    .map(r => ({ ...r, cost: parseCost(r.ship_cost), wt: parseWeight(r.weight) }))
    .filter(r => r.wt > 0)
    .map(r => ({ ...r, cpw: r.cost / r.wt }))

  if (withCPW.length === 0) {
    return { outcomeId: 'margin-erosion', summary: 'Could not calculate cost per weight — check weight column.', findings: [] }
  }

  const avgCPW = withCPW.reduce((sum, r) => sum + r.cpw, 0) / withCPW.length
  const outliers = withCPW.filter(r => r.cpw > avgCPW * 2)

  const byService = groupBy(rows.filter(r => r.service && r.ship_cost), 'service')
  const serviceCosts = [...byService.entries()]
    .map(([service, rs]) => ({
      service,
      avg: rs.reduce((sum, r) => sum + parseCost(r.ship_cost), 0) / rs.length,
      count: rs.length,
    }))
    .sort((a, b) => b.avg - a.avg)

  const summary = outliers.length > 0
    ? `${outliers.length} shipments cost more than 2× your average of ${currency(avgCPW)} per weight unit.`
    : `No major outliers found. Average cost per weight unit is ${currency(avgCPW)}.`

  return {
    outcomeId: 'margin-erosion',
    summary,
    findings: [
      { label: 'Avg cost per weight unit', value: currency(avgCPW) },
      { label: 'High-cost outliers (2× avg)', value: String(outliers.length), highlight: outliers.length > 0 },
      ...serviceCosts.slice(0, 5).map(({ service, avg, count }) => ({
        label: service,
        value: `${currency(avg)} avg — ${count} shipments`,
      })),
    ],
  }
}

// ── Carrier Variance ─────────────────────────────────────────────────

function analyzeCarrierVariance(rows: Row[]): AnalysisResult {
  const valid = rows.filter(r => r.carrier && r.ship_cost)
  if (valid.length === 0) {
    return { outcomeId: 'carrier-variance', summary: 'Not enough data to analyze carrier variance.', findings: [] }
  }

  const byCarrier = groupBy(valid, 'carrier')
  const stats = [...byCarrier.entries()]
    .map(([carrier, rs]) => {
      const costs = rs.map(r => parseCost(r.ship_cost))
      const avg = costs.reduce((a, b) => a + b, 0) / costs.length
      const min = Math.min(...costs)
      const max = Math.max(...costs)
      return { carrier, avg, min, max, count: costs.length, spread: max - min }
    })
    .sort((a, b) => b.spread - a.spread)

  const top = stats[0]
  const summary = stats.length > 1
    ? `${top.carrier} has the widest rate spread — ${currency(top.min)} to ${currency(top.max)} for similar shipments.`
    : `All shipments used ${top.carrier}. Upload data from multiple carriers to compare rates.`

  return {
    outcomeId: 'carrier-variance',
    summary,
    findings: stats.map(({ carrier, avg, min, max, count, spread }) => ({
      label: carrier,
      value: `${currency(min)}–${currency(max)} · avg ${currency(avg)} · ${count} shipments`,
      highlight: carrier === top.carrier && stats.length > 1 && spread > 0,
    })),
  }
}

// ── Packaging Variance ───────────────────────────────────────────────

interface BucketStat {
  label: string
  avg: number
  min: number
  max: number
  count: number
  spread: number
}

function analyzePackagingVariance(rows: Row[]): AnalysisResult {
  const valid = rows.filter(r => r.ship_cost && r.weight)
  if (valid.length < 5) {
    return { outcomeId: 'packaging-variance', summary: 'Not enough data for packaging variance analysis.', findings: [] }
  }

  const parsed = valid
    .map(r => ({ cost: parseCost(r.ship_cost), wt: parseWeight(r.weight) }))
    .filter(r => r.wt > 0)

  const buckets = [
    { label: 'Under 1 lb', min: 0, max: 1 },
    { label: '1–5 lbs', min: 1, max: 5 },
    { label: '5–10 lbs', min: 5, max: 10 },
    { label: 'Over 10 lbs', min: 10, max: Infinity },
  ]

  const bucketStats: BucketStat[] = buckets.flatMap(bucket => {
    const items = parsed.filter(r => r.wt >= bucket.min && r.wt < bucket.max)
    if (items.length === 0) return []
    const avg = items.reduce((sum, r) => sum + r.cost, 0) / items.length
    const min = Math.min(...items.map(r => r.cost))
    const max = Math.max(...items.map(r => r.cost))
    return [{ label: bucket.label, avg, min, max, count: items.length, spread: max - min }]
  })

  const top = [...bucketStats].sort((a, b) => b.spread - a.spread)[0]

  const summary = top && top.spread > 2
    ? `${top.label} has the most cost variance — ${currency(top.min)} to ${currency(top.max)} for similar packages.`
    : 'Packaging costs look fairly consistent across weight ranges.'

  return {
    outcomeId: 'packaging-variance',
    summary,
    findings: bucketStats.map(b => ({
      label: b.label,
      value: `${currency(b.min)}–${currency(b.max)} · avg ${currency(b.avg)} · ${b.count} shipments`,
      highlight: b.label === top?.label && top.spread > 2,
    })),
  }
}

// ── Fulfillment Integrity ────────────────────────────────────────────

function analyzeFulfillmentIntegrity(rows: Row[]): AnalysisResult {
  const withOrder = rows.filter(r => r.order_id)
  const missingTracking = withOrder.filter(r => !r.tracking_number?.trim())

  const byTracking = groupBy(rows.filter(r => r.tracking_number), 'tracking_number')
  const multiOrder = [...byTracking.entries()].filter(([, rs]) => {
    const ids = new Set(rs.filter(r => r.order_id).map(r => r.order_id.trim()))
    return ids.size > 1
  })

  const total = missingTracking.length + multiOrder.length
  if (total === 0) {
    return {
      outcomeId: 'fulfillment-integrity',
      summary: 'Fulfillment data looks clean — no missing tracking or mismatched orders.',
      findings: [{ label: 'Issues found', value: 'None' }],
    }
  }

  const summary = `Found ${total} fulfillment ${total === 1 ? 'issue' : 'issues'} — ${missingTracking.length} orders missing tracking, ${multiOrder.length} tracking numbers linked to multiple orders.`

  const findings: Finding[] = [
    missingTracking.length > 0
      ? { label: 'Orders missing tracking', value: String(missingTracking.length), highlight: true }
      : null,
    multiOrder.length > 0
      ? { label: 'Tracking on multiple orders', value: String(multiOrder.length), highlight: true }
      : null,
    ...missingTracking.slice(0, 5).map(r => ({
      label: `Order ${r.order_id}`,
      value: 'No tracking number',
    })),
  ].filter((f): f is Finding => f !== null)

  return { outcomeId: 'fulfillment-integrity', summary, findings }
}

// ── Return Pressure ──────────────────────────────────────────────────

function analyzeReturnPressure(rows: Row[]): AnalysisResult {
  const withOrder = rows.filter(r => r.order_id)
  if (withOrder.length === 0) {
    return { outcomeId: 'return-pressure', summary: 'No order data found for return analysis.', findings: [] }
  }

  const byOrder = groupBy(withOrder, 'order_id')
  const multiShip = [...byOrder.entries()].filter(([, rs]) => rs.length > 1)
  const multiShipRate = (multiShip.length / byOrder.size) * 100

  const carrierCounts = new Map<string, number>()
  for (const [, rs] of multiShip) {
    const carrier = rs[0].carrier || 'Unknown'
    carrierCounts.set(carrier, (carrierCounts.get(carrier) || 0) + 1)
  }

  const summary = multiShip.length > 0
    ? `${multiShip.length} orders had multiple shipments (${multiShipRate.toFixed(1)}% of total) — possible returns or re-ships.`
    : 'No orders with multiple shipments detected. Return pressure looks low.'

  return {
    outcomeId: 'return-pressure',
    summary,
    findings: [
      { label: 'Total unique orders', value: String(byOrder.size) },
      {
        label: 'Multi-shipment orders',
        value: `${multiShip.length} (${multiShipRate.toFixed(1)}%)`,
        highlight: multiShip.length > 0,
      },
      ...[...carrierCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([carrier, count]) => ({
          label: `${carrier} multi-shipments`,
          value: String(count),
        })),
    ],
  }
}

// ── Dispatcher ───────────────────────────────────────────────────────

export function runAnalysis(outcomeId: string, rows: Row[]): AnalysisResult {
  switch (outcomeId) {
    case 'carrier-performance':   return analyzeCarrierPerformance(rows)
    case 'duplicate-charges':     return analyzeDuplicateCharges(rows)
    case 'budget-breakdown':      return analyzeBudgetBreakdown(rows)
    case 'margin-erosion':        return analyzeMarginErosion(rows)
    case 'carrier-variance':      return analyzeCarrierVariance(rows)
    case 'packaging-variance':    return analyzePackagingVariance(rows)
    case 'fulfillment-integrity': return analyzeFulfillmentIntegrity(rows)
    case 'return-pressure':       return analyzeReturnPressure(rows)
    default:
      return { outcomeId, summary: `Unknown analysis type: ${outcomeId}`, findings: [] }
  }
}

export function extractRows(
  rawRows: unknown[][],
  columnMap: Record<string, string>
): Row[] {
  if (rawRows.length < 2) return []
  const headers = (rawRows[0] as string[]).map(h => String(h ?? ''))
  return rawRows.slice(1)
    .map(row => {
      const obj: Row = {}
      for (const [concept, columnName] of Object.entries(columnMap)) {
        const idx = headers.indexOf(columnName)
        if (idx >= 0) obj[concept] = String((row as unknown[])[idx] ?? '')
      }
      return obj
    })
    .filter(row => Object.values(row).some(v => v !== ''))
}
