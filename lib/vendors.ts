export type VendorId =
  | 'shipstation'
  | 'shopify'
  | 'pirateship'
  | 'easypost'
  | 'shippo'
  | 'woocommerce'
  | 'unknown'

export interface DetectedVendor {
  id: VendorId
  name: string
}

interface VendorSignature {
  id: VendorId
  name: string
  columns: string[]
  threshold: number
}

const SIGNATURES: VendorSignature[] = [
  {
    id: 'shipstation',
    name: 'ShipStation',
    columns: ['Order ID', 'Order Date', 'Ship Date', 'Tracking Number', 'Carrier', 'Service', 'Ship Cost', 'Weight'],
    threshold: 4,
  },
  {
    id: 'shopify',
    name: 'Shopify',
    columns: ['Name', 'Email', 'Financial Status', 'Paid at', 'Fulfillment Status', 'Fulfilled at', 'Lineitem name', 'Shipping Name'],
    threshold: 4,
  },
  {
    id: 'pirateship',
    name: 'Pirateship',
    columns: ['Shipment ID', 'Created Date', 'Carrier', 'Service', 'Weight (oz)', 'Rate', 'To Name', 'To Zip'],
    threshold: 3,
  },
  {
    id: 'easypost',
    name: 'EasyPost',
    columns: ['id', 'created_at', 'tracker.carrier', 'selected_rate.rate', 'postage_label.label_url'],
    threshold: 2,
  },
  {
    id: 'shippo',
    name: 'Shippo',
    columns: ['Transaction ID', 'Transaction Date', 'Carrier', 'Service Level', 'Weight', 'Postage Amount', 'Tracking Number'],
    threshold: 3,
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    columns: ['order_id', 'order_date', 'order_status', 'shipping_first_name', 'shipping_method', 'order_total'],
    threshold: 3,
  },
]

export function detectVendor(headers: string[]): DetectedVendor | null {
  const normalized = headers.map((h) => h.trim().toLowerCase())

  let best: { sig: VendorSignature; count: number } | null = null

  for (const sig of SIGNATURES) {
    const count = sig.columns.filter((col) =>
      normalized.includes(col.toLowerCase())
    ).length

    if (count >= sig.threshold && (!best || count > best.count)) {
      best = { sig, count }
    }
  }

  if (!best) return null
  return { id: best.sig.id, name: best.sig.name }
}
