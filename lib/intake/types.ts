export type Answers = Record<string, boolean | string>

export interface BinaryQuestion {
  type: 'binary'
  id: string
  text: string
  stateKey: string
}

export interface SelectQuestion {
  type: 'select'
  id: string
  text: string
  stateKey: string
  options: Array<{ label: string; value: string }>
}

export type Question = BinaryQuestion | SelectQuestion

export interface Route {
  when: (answers: Answers) => boolean
  outcomeId: string
}

export interface Category {
  id: string
  label: string
  tagline: string
  questions: Question[]
  routes: Route[]
  fallback: string
}

export interface IntakeTree {
  domain: string
  categories: Category[]
}
