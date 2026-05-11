import type { Request } from 'express'
import type { UserParams } from '../../features/users/users.validator.ts'

export const isAuthenticated = (
  user: UserParams | NonNullable<Request['user']>
): user is NonNullable<Request['user']> => 'email' in user && !!user.email
