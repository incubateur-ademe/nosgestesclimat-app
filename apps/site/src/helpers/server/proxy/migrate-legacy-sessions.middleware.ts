import {
  buildSessionCookies,
  SESSION_COOKIE,
} from '@/helpers/server/cookie/auth.cookie'
import { decryptSession } from '@nosgestesclimat/core/features/auth/services/decrypt-session.service'
import { migrateLegacySessions } from '@nosgestesclimat/core/features/auth/services/migrate-legacy-sessions.service'
import { getIronSession } from 'iron-session'
import type { NextRequest } from 'next/server'
import type { MiddlewareResult } from './types'

const ANON_SESSION_COOKIE = 'ngc_anon_user'

const anonSessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieName: ANON_SESSION_COOKIE,
  ttl: 0,
}


// Options figées sur l'état des cookies legacy au moment de leur pose (avant
// la refonte authentification, ec804e964^).
const LEGACY_COOKIE_DELETION_OPTIONS = {
  httpOnly: true,
  secure: true,
  partitioned: true,
  sameSite: 'none' as const,
  domain: new URL(process.env.NEXT_PUBLIC_SITE_URL!).hostname,
  path: '/',
  maxAge: 0,
}

export async function middlewareMigrateLegacySessions(
  request: NextRequest
): Promise<MiddlewareResult> {
  if (request.cookies.get(SESSION_COOKIE)) {
    return { redirect: null, cookies: [] }
  }

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

  const tokens = await migrateLegacySessions({ ironUserId })
  if (!tokens) {
    return { redirect: null, cookies: [] }
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
      {
        name: ANON_SESSION_COOKIE,
        value: '',
        options: LEGACY_COOKIE_DELETION_OPTIONS,
      },
    ],
  }
}
