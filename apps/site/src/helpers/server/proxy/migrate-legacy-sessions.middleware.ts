import {
  buildSessionCookies,
  SESSION_COOKIE,
} from '@/helpers/server/cookie/auth.cookie'
import { maskEmail, truncateUserId } from '@/utils/maskEmail'
import { decryptSession } from '@nosgestesclimat/core/features/auth/services/decrypt-session.service'
import { migrateLegacySessions } from '@nosgestesclimat/core/features/auth/services/migrate-legacy-sessions.service'
import { getIronSession } from 'iron-session'
import type { NextRequest } from 'next/server'
import { InternalError } from '../error'
import logger from '../../../logger.ts'
import type { MiddlewareResult } from './types'

const ANON_SESSION_COOKIE = 'ngc_anon_user'
const LEGACY_SESSION_COOKIE = process.env.SERVER_AUTH_COOKIE_NAME

const anonSessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieName: ANON_SESSION_COOKIE,
  ttl: 0,
}

if (!LEGACY_SESSION_COOKIE) {
  throw new InternalError('SERVER_AUTH_COOKIE_NAME is not defined')
}

export async function middlewareMigrateLegacySessions(
  request: NextRequest
): Promise<MiddlewareResult> {
  if (request.cookies.get(SESSION_COOKIE)) {
    return { redirect: null, cookies: [] }
  }

  const jwt = request.cookies.get(LEGACY_SESSION_COOKIE!)?.value
  let ironUserId: string | undefined
  const anonCookie = request.cookies.get(ANON_SESSION_COOKIE)
  if (anonCookie) {
    try {
      const session = await getIronSession<{ userId?: string }>(
        request,
        new Response(),
        anonSessionOptions
      )
      ironUserId = session.userId
    } catch {
      // ignore corrupt cookie, ironUserId stays undefined
    }
  }

  const legacyContext = {
    hadLegacyJwt: !!jwt,
    hadAnonCookie: !!anonCookie,
    requestId: request.headers.get('x-request-id') ?? undefined,
  }

  const tokens = await migrateLegacySessions({ jwt, ironUserId })
  if (!tokens) {
    // Steady-state requests carry no legacy cookie and must stay silent; a
    // legacy cookie that fails to migrate is exactly the kind of silent login
    // dead-end we need to see.
    if (jwt) {
      logger.warn('[auth] Legacy session migration returned no tokens', {
        ...legacyContext,
      })
    }
    return { redirect: null, cookies: [] }
  }

  let userId: string
  let email: string | undefined
  try {
    const payload = await decryptSession(tokens.accessToken)
    userId = payload.userId
    email = payload.email
  } catch {
    logger.warn('[auth] Legacy session migration: decrypt of issued tokens failed', {
      ...legacyContext,
    })
    return { redirect: null, cookies: [] }
  }

  request.headers.set('x-session', JSON.stringify({ userId, email }))

  logger.info('[auth] Session issued from legacy migration', {
    ...legacyContext,
    email: maskEmail(email),
    userId: truncateUserId(userId),
  })

  return {
    redirect: null,
    cookies: [
      ...buildSessionCookies(tokens),
      // @tofix on garde les cookies legacy, le temps d’être sûr de ne pas avoir besoin de revert
      // { name: LEGACY_SESSION_COOKIE!, value: '', options: { maxAge: 0 } },
      // { name: ANON_SESSION_COOKIE, value: '', options: { maxAge: 0 } },
    ],
  }
}
