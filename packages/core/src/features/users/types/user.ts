export interface PartialVerifiedUser {
  id: string
  email: string
}

interface UserBase {
  id: string
  name: string | null
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
}

export interface NewUnverifiedUser extends NewUserBase {
  type: 'unverified'
}

export interface NewVerifiedUser extends NewUserBase {
  type: 'verified'
  email: string
  telephone?: string | null
  position?: string | null
  optedInForCommunications?: boolean
}

export type NewUser = NewUnverifiedUser | NewVerifiedUser
