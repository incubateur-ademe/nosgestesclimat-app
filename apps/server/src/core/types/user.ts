export interface PartialAnonymousUser {
  id: string
}

export interface PartialVerifiedUser {
  id: string
  email: string
}

export type PartialUser = PartialAnonymousUser | PartialVerifiedUser
