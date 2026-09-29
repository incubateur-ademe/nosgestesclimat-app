import type { AgeRange } from './age-range.ts'

export interface PartialVerifiedUser {
  id: string
  email: string
}

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

interface NewUserBase {
  id: string
  name?: string | null
  ageRange?: AgeRange | null
}

export interface NewUnverifiedUser extends NewUserBase {
  type: 'unverified'
  email?: null
}

export interface NewVerifiedUser extends NewUserBase {
  type: 'verified'
  email: string
  telephone?: string | null
  position?: string | null
  optedInForCommunications?: boolean
}

export type NewUser = NewUnverifiedUser | NewVerifiedUser
