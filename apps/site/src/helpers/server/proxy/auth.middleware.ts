import {
  buildSessionCookies,
  deleteSessionCookies,
  REFRESH_COOKIE,
} from '@/helpers/server/cookie/auth.cookie'
import logger from '@/logger/logger.server'
import {
  renewSession,
  type RenewedTokens,
} from '@nosgestesclimat/core/features/auth/services/renew-session.service'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import { type NextRequest } from 'next/server'
import { match } from 'ts-pattern'
import { readSession, setSessionHeader } from './session-header'
import type { MiddlewareResult } from './types'

/** Auth middleware: decrypts session, validates, silently renews expired
 * tokens. Returns a redirect or cookies for the final response. */
export async function middlewareAuth(
  request: NextRequest
): Promise<MiddlewareResult> {
  const middlewareLogger = logger.child({ scope: 'site.middleware.auth' })
  const session = await readSession(request)

  // (A) No session cookie: anonymous user.
  if (session.status === 'absent') {
    return { redirect: null, cookies: [] }
  }

  // (B) Corrupted or tampered session cookie: log and treat as anonymous.
  if (session.status === 'invalid') {
    middlewareLogger.warn(toError(session.error))
    return { redirect: null, cookies: deleteSessionCookies() }
  }

  const { payload } = session

  if (session.status === 'valid') {
    setSessionHeader(request, payload)
    return { redirect: null, cookies: [] }
  }

  const refreshCookie = request.cookies.get(REFRESH_COOKIE)
  if (!refreshCookie) {
    // (D) Expired session without a refresh cookie: the session is over.
    middlewareLogger.warn('Session expired but no refresh cookie present')
    return { redirect: null, cookies: deleteSessionCookies() }
  }

  let outcome: Awaited<ReturnType<typeof renewSession>>
  try {
    outcome = await renewSession({
      refreshToken: refreshCookie.value,
      email: payload.email,
    })
  } catch (err) {
    // The renewal could not be decided — the database is unreachable, not the
    // session. Dropping the cookies here would turn an outage into a logout.
    middlewareLogger.error(toError(err))
    return { redirect: null, cookies: [] }
  }

  const continueAsUser = (tokens: RenewedTokens): MiddlewareResult => {
    setSessionHeader(request, payload)
    return { redirect: null, cookies: buildSessionCookies(tokens) }
  }

  return match(outcome)
    .with({ status: 'rotated' }, ({ tokens }) => continueAsUser(tokens))
    .with({ status: 'concurrent' }, ({ tokens, ageMs }) => {
      // The rotation this request raced against owns the new key.
      middlewareLogger.debug('Session renewal hit a concurrent rotation', {
        ageMs,
      })
      return continueAsUser(tokens)
    })
    .with({ status: 'replayed' }, ({ ageMs }) => {
      // The family is already revoked; the age is what separates a replay from
      // a race.
      middlewareLogger.warn(
        'Stale refresh token presented past the tolerance',
        {
          ageMs,
          verified: Boolean(payload.email),
        }
      )
      return { redirect: null, cookies: deleteSessionCookies() }
    })
    .with({ status: 'unrecognised' }, () => {
      // Expired, revoked or never issued.
      return { redirect: null, cookies: deleteSessionCookies() }
    })
    .exhaustive()
}
