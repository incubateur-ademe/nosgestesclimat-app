import type { PartialVerifiedUser } from '@nosgestesclimat/core/features/users/types/user'

export interface PartialAnonymousUser {
  id: string
}

export type { PartialVerifiedUser }
export type PartialUser = PartialAnonymousUser | PartialVerifiedUser
