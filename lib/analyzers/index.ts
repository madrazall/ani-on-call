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
  const totalSpend = valid.reduce((sum, r) => sum + (r.ship_cost ? parseCost(r.ship_cost) : 0), 0)
  const sorted = [...groups.entries()]
    .map(([carrier, rs]) => {
      const spend = rs.reduce((sum, r) => sum + (r.ship_cost ? parseCost(r.ship_cost) : 0), 0)
      return { carrier, count: rs.length, spend }
    })
    .sort((a, b) => b.count - a.count)

  const top = sorted[0]
  const topSpender = totalSpend > 0 ? [...sorted].sort((a, b) => b.spend - a.spend)[0] : null
  const volumeVsSpendMismatch = topSpender && topSpender.carrier !== top.carrier

  const summary = sorted.length === 1
    ? `All ${total} shipments went through ${top.carrier}${totalSpend > 0 ? `, totaling ${currency(top.spend)}` : ''}.`
    : volumeVsSpendMismatch
    ? `You've shipped with ${sorted.length} carriers. ${top.carrier} handles the most volume (${pct(top.count, total)}), but ${topSpender!.carrier} is actually your biggest cost at ${currency(topSpender!.spend)}.`
    : `You've shipped with ${sorted.length} carriers. ${top.carrier} handles ${pct(top.count, total)} of your volume${totalSpend > 0 ? ` and ${currency(top.spend)} in spend` : ''}.`

  return {
    outcomeId: 'carrier-performance',
    summary,
    findings: sorted.map(({ carrier, count, spend }) => ({
      label: carrier,
      value: totalSpend > 0
        ? `${count} shipments — ${pct(count, total)} / ${currency(spend)} — ${pct(spend, totalSpend)} of spend`
        : `${count} shipments — ${pct(count, total)}`,
      highlight: carrier === top.carrier || carrier === topSpender?.carrier,
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

  // Estimate the disputable amount per group: total billed minus one "legitimate"
  // charge (approximated as the group average) — i.e. the excess from being billed
  // more than once for what should have been a single shipment.
  function overcharge(rs: Row[]): number {
    const costs = rs.filter(r => r.ship_cost).map(r => parseCost(r.ship_cost))
    if (costs.length === 0) return 0
    const total = costs.reduce((s, c) => s + c, 0)
    const avg = total / costs.length
    return Math.max(0, total - avg)
  }

  const totalAtRisk = dupOrders.reduce((s, [, rs]) => s + overcharge(rs), 0)
    + dupTracking.reduce((s, [, rs]) => s + overcharge(rs), 0)

  const summary = totalAtRisk > 0
    ? `Found ${total} potential duplicate ${total === 1 ? 'charge' : 'charges'} — ${dupOrders.length} by order ID, ${dupTracking.length} by tracking number. Roughly ${currency(totalAtRisk)} in disputable overcharges.`
    : `Found ${total} potential duplicate ${total === 1 ? 'charge' : 'charges'} — ${dupOrders.length} by order ID, ${dupTracking.length} by tracking number.`

  return {
    outcomeId: 'duplicate-charges',
    summary,
    findings: [
      ...(totalAtRisk > 0 ? [{ label: 'Estimated disputable total', value: currency(totalAtRisk), highlight: true }] : []),
      ...dupOrders.slice(0, 10).map(([id, rs]) => {
        const over = overcharge(rs)
        return {
          label: `Order ${id}`,
          value: over > 0 ? `${rs.length} charges — ${currency(over)} likely excess` : `${rs.length} charges`,
          highlight: true,
        }
      }),
      ...dupTracking.slice(0, 10).map(([tn, rs]) => {
        const over = overcharge(rs)
        return {
          label: `Tracking ${tn}`,
          value: over > 0 ? `${rs.length} shipments — ${currency(over)} likely excess` : `${rs.length} shipments`,
          highlight: true,
        }
      }),
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
      count: rs.length,
    }))
    .sort((a, b) => b.total - a.total)

  const top = carrierTotals[0]
  const summary = `Total shipping spend: ${currency(totalSpend)}. ${top ? `${top.carrier} is your biggest cost at ${currency(top.total)} across ${top.count} ${top.count === 1 ? 'package' : 'packages'}.` : ''}`

  return {
    outcomeId: 'budget-breakdown',
    summary,
    findings: [
      { label: 'Total spend', value: `${currency(totalSpend)} — ${valid.length} ${valid.length === 1 ? 'package' : 'packages'}`, highlight: true },
      ...carrierTotals.map(({ carrier, total, count }) => ({
        label: carrier,
        value: `${currency(total)} — ${pct(total, totalSpend)} / ${count} ${count === 1 ? 'package' : 'packages'}`,
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

  // Which carrier the missing-tracking orders cluster around, if any — a single
  // carrier standing out here usually means a process gap on their end, not yours.
  const missingByCarrier = new Map<string, number>()
  for (const r of missingTracking) {
    const carrier = r.carrier?.trim() || 'Unknown'
    missingByCarrier.set(carrier, (missingByCarrier.get(carrier) || 0) + 1)
  }
  const carrierBreakdown = [...missingByCarrier.entries()]
    .sort((a, b) => b[1] - a[1])
  const topCarrier = carrierBreakdown[0]
  const carrierIsFocused = topCarrier && carrierBreakdown.length > 1 && topCarrier[1] / missingTracking.length >= 0.6

  const summary = `Found ${total} fulfillment ${total === 1 ? 'issue' : 'issues'} — ${missingTracking.length} orders missing tracking, ${multiOrder.length} tracking numbers linked to multiple orders.`
    + (carrierIsFocused ? ` Missing tracking is concentrated on ${topCarrier[0]} (${topCarrier[1]} of ${missingTracking.length}).` : '')

  const findings: Finding[] = [
    missingTracking.length > 0
      ? { label: 'Orders missing tracking', value: String(missingTracking.length), highlight: true }
      : null,
    multiOrder.length > 0
      ? { label: 'Tracking on multiple orders', value: String(multiOrder.length), highlight: true }
      : null,
    ...(missingTracking.length > 0 && carrierBreakdown.length > 1
      ? carrierBreakdown.map(([carrier, count]) => ({
          label: `Missing tracking — ${carrier}`,
          value: `${count} ${count === 1 ? 'order' : 'orders'}`,
          highlight: carrier === topCarrier?.[0] && carrierIsFocused,
        }))
      : []),
    ...missingTracking.slice(0, 5).map(r => ({
      label: `Order ${r.order_id}`,
      value: r.carrier ? `No tracking number — ${r.carrier}` : 'No tracking number',
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

// ── Weight Bracket Creep ─────────────────────────────────────────────

const WEIGHT_BRACKETS = [1, 2, 3, 5, 10, 15, 20, 30, 50]
const CREEP_MARGIN = 0.3 // lbs above a bracket line still counts as "just tipped over"

function analyzeWeightBracketCreep(rows: Row[]): AnalysisResult {
  const valid = rows
    .filter(r => r.ship_cost && r.weight)
    .map(r => ({ cost: parseCost(r.ship_cost), wt: parseWeight(r.weight) }))
    .filter(r => r.wt > 0)

  if (valid.length < 5) {
    return { outcomeId: 'weight-bracket-creep', summary: 'Not enough weight and cost data to check for bracket creep.', findings: [] }
  }

  const groups = WEIGHT_BRACKETS.map(threshold => {
    const justOver = valid.filter(r => r.wt > threshold && r.wt <= threshold + CREEP_MARGIN)
    const justUnder = valid.filter(r => r.wt > threshold - CREEP_MARGIN && r.wt <= threshold)
    if (justOver.length === 0) return null

    const avgOverCost = justOver.reduce((s, r) => s + r.cost, 0) / justOver.length
    const avgUnderCost = justUnder.length > 0
      ? justUnder.reduce((s, r) => s + r.cost, 0) / justUnder.length
      : null

    return { threshold, count: justOver.length, avgOverCost, avgUnderCost }
  }).filter((g): g is NonNullable<typeof g> => g !== null)

  if (groups.length === 0) {
    return {
      outcomeId: 'weight-bracket-creep',
      summary: 'No shipments found sitting just above a common weight bracket line.',
      findings: [],
    }
  }

  const withGap = groups.filter(g => g.avgUnderCost !== null && g.avgOverCost > g.avgUnderCost)
  const totalShipments = groups.reduce((s, g) => s + g.count, 0)
  const estimatedExtra = withGap.reduce((s, g) => s + (g.avgOverCost - (g.avgUnderCost as number)) * g.count, 0)

  const summary = withGap.length > 0
    ? `${totalShipments} shipments landed just over a weight bracket line. Where a cheaper bracket was visible just below it, that creep may have cost you roughly ${currency(estimatedExtra)}.`
    : `${totalShipments} shipments landed just over a weight bracket line, but there wasn't enough data just under the line to estimate the cost difference yet.`

  return {
    outcomeId: 'weight-bracket-creep',
    summary,
    findings: [...groups]
      .sort((a, b) => b.count - a.count)
      .map(g => ({
        label: `Just over ${g.threshold} lb${g.threshold === 1 ? '' : 's'}`,
        value: g.avgUnderCost !== null
          ? `${g.count} shipments · avg ${currency(g.avgOverCost)} vs ${currency(g.avgUnderCost)} just under the line`
          : `${g.count} shipments · avg ${currency(g.avgOverCost)} (no comparison data just under)`,
        highlight: g.avgUnderCost !== null && g.avgOverCost > g.avgUnderCost,
      })),
  }
}

// ── Service Level Overspend ──────────────────────────────────────────

const WEIGHT_BUCKETS = [
  { label: 'Under 1 lb', min: 0, max: 1 },
  { label: '1–5 lbs', min: 1, max: 5 },
  { label: '5–10 lbs', min: 5, max: 10 },
  { label: 'Over 10 lbs', min: 10, max: Infinity },
]

function analyzeServiceOverspend(rows: Row[]): AnalysisResult {
  const valid = rows
    .filter(r => r.service && r.ship_cost && r.weight)
    .map(r => ({ service: r.service.trim(), cost: parseCost(r.ship_cost), wt: parseWeight(r.weight) }))
    .filter(r => r.wt > 0 && r.service)

  if (valid.length < 5) {
    return { outcomeId: 'service-level-overspend', summary: 'Not enough service-level and weight data to compare.', findings: [] }
  }

  const findings: Finding[] = []
  let totalOverspend = 0
  let flaggedShipments = 0

  for (const bucket of WEIGHT_BUCKETS) {
    const inBucket = valid.filter(r => r.wt >= bucket.min && r.wt < bucket.max)

    // groupBy() operates on Row (string-keyed) objects; these are pre-parsed numerics, so group manually
    const serviceGroups = new Map<string, { cost: number; wt: number }[]>()
    for (const r of inBucket) {
      if (!serviceGroups.has(r.service)) serviceGroups.set(r.service, [])
      serviceGroups.get(r.service)!.push(r)
    }

    if (serviceGroups.size < 2) continue

    const serviceAvgs = [...serviceGroups.entries()]
      .map(([service, rs]) => ({ service, avg: rs.reduce((s, r) => s + r.cost, 0) / rs.length, count: rs.length }))
      .sort((a, b) => a.avg - b.avg)

    const cheapest = serviceAvgs[0]

    for (const s of serviceAvgs.slice(1)) {
      const premium = (s.avg - cheapest.avg) * s.count
      if (premium <= 0) continue
      totalOverspend += premium
      flaggedShipments += s.count
      findings.push({
        label: `${bucket.label} — ${s.service}`,
        value: `${s.count} shipments · avg ${currency(s.avg)} vs ${currency(cheapest.avg)} for ${cheapest.service} at this weight`,
        highlight: true,
      })
    }

    findings.push({
      label: `${bucket.label} — cheapest option`,
      value: `${cheapest.service} · avg ${currency(cheapest.avg)} · ${cheapest.count} shipments`,
    })
  }

  if (findings.length === 0) {
    return {
      outcomeId: 'service-level-overspend',
      summary: 'Not enough variety in service levels within the same weight range to compare costs yet.',
      findings: [],
    }
  }

  const summary = flaggedShipments > 0
    ? `${flaggedShipments} shipments used a pricier service level than similar-weight packages elsewhere in this file — roughly ${currency(totalOverspend)} more than the cheapest comparable option.`
    : 'Your service-level choices look cost-efficient for the weights you shipped.'

  return { outcomeId: 'service-level-overspend', summary, findings }
}

// ── Re-ship Root Cause ───────────────────────────────────────────────

function analyzeReshipRootCause(rows: Row[]): AnalysisResult {
  const withOrder = rows.filter(r => r.order_id)
  if (withOrder.length === 0) {
    return { outcomeId: 'reship-root-cause', summary: 'No order data found to trace re-ship causes.', findings: [] }
  }

  const byOrder = groupBy(withOrder, 'order_id')
  const orders = [...byOrder.entries()].map(([id, rs]) => ({ id, rows: rs, isMultiShip: rs.length > 1, first: rs[0] }))
  const multiShip = orders.filter(o => o.isMultiShip)

  if (multiShip.length === 0) {
    return { outcomeId: 'reship-root-cause', summary: 'No orders needed more than one shipment — no re-ship pattern to trace here.', findings: [] }
  }

  const byCarrier = new Map<string, { total: number; multi: number }>()
  for (const o of orders) {
    const carrier = (o.first.carrier || 'Unknown').trim() || 'Unknown'
    if (!byCarrier.has(carrier)) byCarrier.set(carrier, { total: 0, multi: 0 })
    const c = byCarrier.get(carrier)!
    c.total++
    if (o.isMultiShip) c.multi++
  }
  const carrierRates = [...byCarrier.entries()]
    .filter(([, v]) => v.total >= 3)
    .map(([carrier, v]) => ({ carrier, rate: (v.multi / v.total) * 100, total: v.total, multi: v.multi }))
    .sort((a, b) => b.rate - a.rate)

  const bucketRates = WEIGHT_BUCKETS.map(b => {
    const inBucket = orders.filter(o => {
      const wt = parseWeight(o.first.weight || '')
      return wt >= b.min && wt < b.max
    })
    if (inBucket.length < 3) return null
    const multi = inBucket.filter(o => o.isMultiShip).length
    return { label: b.label, rate: (multi / inBucket.length) * 100, total: inBucket.length, multi }
  }).filter((b): b is NonNullable<typeof b> => b !== null)
    .sort((a, b) => b.rate - a.rate)

  const topCarrier = carrierRates[0]
  const topBucket = bucketRates[0]

  const parts: string[] = []
  if (topCarrier) parts.push(`${topCarrier.carrier} orders re-ship at ${topCarrier.rate.toFixed(1)}% (${topCarrier.multi} of ${topCarrier.total})`)
  if (topBucket) parts.push(`${topBucket.label} shipments re-ship at ${topBucket.rate.toFixed(1)}%`)

  const summary = parts.length > 0
    ? `${multiShip.length} orders needed more than one shipment. ${parts.join('. ')}.`
    : `${multiShip.length} orders needed more than one shipment, but there wasn't enough volume per carrier or weight class yet to isolate a pattern.`

  return {
    outcomeId: 'reship-root-cause',
    summary,
    findings: [
      { label: 'Orders needing a re-ship', value: String(multiShip.length), highlight: true },
      ...carrierRates.map(c => ({
        label: `${c.carrier} re-ship rate`,
        value: `${c.rate.toFixed(1)}% (${c.multi} of ${c.total} orders)`,
        highlight: topCarrier?.carrier === c.carrier,
      })),
      ...bucketRates.map(b => ({
        label: `${b.label} re-ship rate`,
        value: `${b.rate.toFixed(1)}% (${b.multi} of ${b.total} orders)`,
        highlight: topBucket?.label === b.label,
      })),
    ],
  }
}

// ── Cost Creep Over Time ─────────────────────────────────────────────

function parseMonthKey(v: string): string | null {
  const d = new Date(v)
  if (isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

function analyzeCostCreep(rows: Row[]): AnalysisResult {
  const valid = rows
    .filter(r => r.ship_date && r.ship_cost)
    .map(r => ({ month: parseMonthKey(r.ship_date), cost: parseCost(r.ship_cost) }))
    .filter((r): r is { month: string; cost: number } => r.month !== null)

  if (valid.length < 10) {
    return { outcomeId: 'cost-creep-over-time', summary: 'Not enough dated shipments to spot a trend yet.', findings: [] }
  }

  const byMonth = new Map<string, number[]>()
  for (const r of valid) {
    if (!byMonth.has(r.month)) byMonth.set(r.month, [])
    byMonth.get(r.month)!.push(r.cost)
  }

  const monthly = [...byMonth.entries()]
    .map(([month, costs]) => ({ month, avg: costs.reduce((a, b) => a + b, 0) / costs.length, count: costs.length }))
    .sort((a, b) => a.month.localeCompare(b.month))

  if (monthly.length < 2) {
    return { outcomeId: 'cost-creep-over-time', summary: 'Only one month of data found — upload a wider date range to see a trend.', findings: [] }
  }

  const first = monthly[0]
  const last = monthly[monthly.length - 1]
  const change = first.avg > 0 ? ((last.avg - first.avg) / first.avg) * 100 : 0

  const summary = Math.abs(change) >= 5
    ? `Average cost per shipment ${change > 0 ? 'climbed' : 'dropped'} ${Math.abs(change).toFixed(1)}% from ${monthLabel(first.month)} (${currency(first.avg)}) to ${monthLabel(last.month)} (${currency(last.avg)}).`
    : `Average cost per shipment has stayed fairly steady — ${currency(first.avg)} in ${monthLabel(first.month)} to ${currency(last.avg)} in ${monthLabel(last.month)}.`

  return {
    outcomeId: 'cost-creep-over-time',
    summary,
    findings: monthly.map(m => ({
      label: monthLabel(m.month),
      value: `${currency(m.avg)} avg — ${m.count} shipments`,
      highlight: m.month === last.month && Math.abs(change) >= 5,
    })),
  }
}

// ── Dispatcher ───────────────────────────────────────────────────────

export function runAnalysis(outcomeId: string, rows: Row[]): AnalysisResult {
  switch (outcomeId) {
    case 'carrier-performance':    return analyzeCarrierPerformance(rows)
    case 'duplicate-charges':      return analyzeDuplicateCharges(rows)
    case 'budget-breakdown':       return analyzeBudgetBreakdown(rows)
    case 'margin-erosion':         return analyzeMarginErosion(rows)
    case 'carrier-variance':       return analyzeCarrierVariance(rows)
    case 'packaging-variance':     return analyzePackagingVariance(rows)
    case 'fulfillment-integrity':  return analyzeFulfillmentIntegrity(rows)
    case 'return-pressure':        return analyzeReturnPressure(rows)
    case 'weight-bracket-creep':   return analyzeWeightBracketCreep(rows)
    case 'service-level-overspend': return analyzeServiceOverspend(rows)
    case 'reship-root-cause':      return analyzeReshipRootCause(rows)
    case 'cost-creep-over-time':   return analyzeCostCreep(rows)
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
        if (idx < 0) continue
        const raw = (row as unknown[])[idx]
        // Dates parse to JS Date objects when cellDates is enabled on read —
        // format as an unambiguous ISO date rather than a locale-dependent
        // string, so downstream `new Date(...)` parsing is reliable.
        obj[concept] = raw instanceof Date
          ? raw.toISOString().slice(0, 10)
          : String(raw ?? '')
      }
      return obj
    })
    .filter(row => Object.values(row).some(v => v !== ''))
}
