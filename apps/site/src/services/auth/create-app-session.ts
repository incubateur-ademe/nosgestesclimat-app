'use server'

import { cookies } from 'next/headers'

import { buildSessionCookies } from '@/helpers/server/cookies'
import { createSession } from '@nosgestesclimat/core/features/auth/services/create-session.service'
import type { SessionTokens } from '@nosgestesclimat/core/features/auth/types/session'

/**
 * Crée une session (core) et persiste les tokens dans les cookies (infra).
 *
 * Doit être exécutée dans un contexte Server Action ou Route Handler (elle
 * appelle `cookies().set()`).
 */
export async function createAppSession(
  userId: string,
  email?: string
): Promise<SessionTokens> {
  const tokens = await createSession(userId, email)

  const store = await cookies()
  for (const cookie of buildSessionCookies(tokens)) {
    store.set(cookie.name, cookie.value, cookie.options)
  }

  return tokens
}
