export interface User {
  id: string
  email: string
  name: string
  age: number | null
  skinType: 'Dry' | 'Normal' | 'Combination' | 'Oily' | 'Sensitive' | 'Acne-Prone' | ''
  fitzpatrick: number | null
  concerns: string[]
  contextNotes: string
  trackingMode: 'guided' | 'nerd' | ''
  pregnancy: 'yes' | 'no' | 'unsure' | ''
  prescriptions: 'yes' | 'no' | ''
  barrier: 'yes' | 'no' | 'unsure' | ''
  onboardingComplete: boolean
  createdAt: string
}

export interface Product {
  id: string
  userId: string
  name: string
  brand: string
  category: string
  paoMonths: number
  openedAt: string | null
  fillPercent: number | null
  status: 'active' | 'upcoming' | 'paused' | 'finished'
  activeIngredients: string[]
  notes: string
  createdAt: string
}

export type StepFrequency = 'daily' | 'every-other-day' | '1x-week' | '2x-week' | '3x-week'

export interface RoutineStep {
  id: string
  userId: string
  stepType: string
  productId: string | null
  productName: string
  period: 'AM' | 'PM'
  order: number
  isActive: boolean
  activeIngredient: string
  notes: string
  frequency: StepFrequency
  scheduleDays: number[]        // 0=Sun … 6=Sat; used for 2x/3x-week
  introFrequency: StepFrequency | null  // lower frequency used during intro phase
  introWeeks: number            // 0 = no intro phase
  introStartDate: string | null // ISO date when intro phase began
  scheduledStartDate: string | null // future date when this step becomes active
}

export interface ReactionEntry {
  id: string
  userId: string
  date: string
  severity: number
  productsInvolved: string[]
  symptoms: string[]
  zone: string
  notes: string
  createdAt: string
}

export interface SkinAnalysisEntry {
  id: string
  userId: string
  date: string
  hydration: number
  redness: number
  texture: number
  breakoutActivity: 'None' | 'Mild' | 'Moderate' | 'Severe'
  routineVersion: string
  zone: string
  notes: string
  createdAt: string
}

export interface ProjectPanItem {
  id: string
  userId: string
  productId: string | null
  productName: string
  brand: string
  category: string
  targetDate: string
  usagePercent: number
  notes: string
  journal: string
  finished: boolean
  finishedAt: string | null
  createdAt: string
}

export interface UserSettings {
  experienceMode: 'guided' | 'nerd'
  skinType: 'Dry' | 'Combination' | 'Oily' | 'Normal' | 'Sensitive' | 'Acne-Prone'
  sensitivities: string[]
  warningSensitivity: 1 | 2 | 3
  notifExpiry: boolean
  notifMilestones: boolean
  notifCheckin: boolean
  timezone: string
}

export interface UserData {
  products: Product[]
  routineSteps: RoutineStep[]
  reactionEntries: ReactionEntry[]
  skinAnalysisEntries: SkinAnalysisEntry[]
  projectPanItems: ProjectPanItem[]
  settings: UserSettings
}

export type OnboardingProfile = Pick<
  User,
  'name' | 'age' | 'skinType' | 'fitzpatrick' | 'concerns' |
  'contextNotes' | 'trackingMode' | 'pregnancy' | 'prescriptions' | 'barrier'
>
