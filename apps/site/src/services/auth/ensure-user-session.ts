'use server'

import type { AppUser } from '@nosgestesclimat/core/features/auth/types/user-session'
import { registerUnverifiedUser } from '@nosgestesclimat/core/features/users/services/register-unverified-user.service'

import { createAppSession } from './create-app-session'
import { getUserSession } from './get-user-session'

/**
 * Guarantees the visitor has an identity before anything is written in their
 * name.
 *
 * A first-time visitor gets an anonymous account and a session in one go: the
 * account is unreachable without the session, so the two are never created
 * apart. Both live here rather than in the core services because the session
 * is cookies, and cookies can only be written from a Server Action or a Route
 * Handler - calling this while rendering a Server Component throws.
 */
export async function ensureUserSession(): Promise<AppUser> {
  const existingSession = await getUserSession()
  if (existingSession) return existingSession

  const { id } = await registerUnverifiedUser()
  await createAppSession(id)

  return { id, isAuth: false }
}
