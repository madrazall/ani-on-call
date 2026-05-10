export type { Answers, Question, BinaryQuestion, SelectQuestion, Route, Category, IntakeTree } from './types'
export { shippingTree } from './shipping'

import type { Category, Answers } from './types'

export function resolveRoute(category: Category, answers: Answers): string {
  for (const route of category.routes) {
    if (route.when(answers)) return route.outcomeId
  }
  return category.fallback
}
