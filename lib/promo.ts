// First-analysis-free launch promo.
// Change PROMO_END to extend or end the promotion — everything else reads from this.
export const PROMO_END = new Date('2026-09-15T00:00:00Z')

export function isPromoActive(): boolean {
  return Date.now() < PROMO_END.getTime()
}
