'use server'

import { cookies } from 'next/headers'

import { getCookieOptions } from '@/helpers/server/cookies'
import {
  REFRESH_COOKIE,
  SESSION_COOKIE,
} from '@/helpers/server/proxy/middleware-auth'
import { REFRESH_TOKEN_TTL_DAYS } from '@nosgestesclimat/core/features/auth/constants/session'
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
  store.set(SESSION_COOKIE, tokens.accessToken, {
    ...getCookieOptions(),
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 3600,
  })
  store.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...getCookieOptions(),
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 3600,
  })

  return tokens
}
