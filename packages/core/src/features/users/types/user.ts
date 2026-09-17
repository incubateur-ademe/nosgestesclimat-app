import type { AgeRange } from './age-range.ts'

export interface UserProfile {
  ageRange: AgeRange | null
}

interface UserBase {
  id: string
  name: string | null
  ageRange: AgeRange | null
  createdAt: Date
  updatedAt: Date
}

export interface UnverifiedUser extends UserBase {
  type: 'unverified'
  email: null
}

export interface VerifiedUser extends UserBase {
  type: 'verified'
  email: string
  telephone: string | null
  position: string | null
  optedInForCommunications: boolean
}

export type User = UnverifiedUser | VerifiedUser
