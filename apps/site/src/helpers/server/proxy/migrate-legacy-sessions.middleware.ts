import {
  buildSessionCookies,
  SESSION_COOKIE,
} from '@/helpers/server/cookie/auth.cookie'
import { decryptSession } from '@nosgestesclimat/core/features/auth/services/decrypt-session.service'
import { migrateLegacySessions } from '@nosgestesclimat/core/features/auth/services/migrate-legacy-sessions.service'
import { getIronSession } from 'iron-session'
import type { NextRequest } from 'next/server'
import { InternalServerError } from '../error'
import type { MiddlewareResult } from './types'

const ANON_SESSION_COOKIE = 'ngc_anon_user'
const LEGACY_SESSION_COOKIE = process.env.SERVER_AUTH_COOKIE_NAME

const anonSessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieName: ANON_SESSION_COOKIE,
  ttl: 0,
}

if (!LEGACY_SESSION_COOKIE) {
  throw new InternalServerError('SERVER_AUTH_COOKIE_NAME is not defined')
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

  const tokens = await migrateLegacySessions({ jwt, ironUserId })
  if (!tokens) {
    const cookies: MiddlewareResult['cookies'] = []
    if (jwt)
      cookies.push({
        name: LEGACY_SESSION_COOKIE!,
        value: '',
        options: { maxAge: 0 },
      })
    if (anonCookie)
      cookies.push({
        name: ANON_SESSION_COOKIE,
        value: '',
        options: { maxAge: 0 },
      })
    return { redirect: null, cookies }
  }

  let userId: string
  let email: string | undefined
  try {
    const payload = await decryptSession(tokens.accessToken)
    userId = payload.userId
    email = payload.email
  } catch {
    return { redirect: null, cookies: [] }
  }

  request.headers.set('x-session', JSON.stringify({ userId, email }))

  return {
    redirect: null,
    cookies: [
      ...buildSessionCookies(tokens),
      { name: LEGACY_SESSION_COOKIE!, value: '', options: { maxAge: 0 } },
      { name: ANON_SESSION_COOKIE, value: '', options: { maxAge: 0 } },
    ],
  }
}
