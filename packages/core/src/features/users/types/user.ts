import type { AgeRange } from './age-range.ts'

export interface UserProfile {
  ageRange: AgeRange | null
}

export interface FullUser {
  id: string
  name: string | null
  email: string | null
  ageRange: AgeRange | null
  createdAt: Date
  updatedAt: Date
  telephone: string | null
  position: string | null
  optedInForCommunications: boolean
}
