import {
  buildSessionCookies,
  deleteSessionCookies,
  REFRESH_COOKIE,
  SESSION_COOKIE,
} from '@/helpers/server/cookie/auth.cookie'
import { TokenConsumedException } from '@nosgestesclimat/core/features/auth/exceptions/token-consumed.exception'
import { TokenExpiredException } from '@nosgestesclimat/core/features/auth/exceptions/token-expired.exception'
import { isSessionExpired } from '@nosgestesclimat/core/features/auth/helpers/is-session-expired'
import { decryptSession } from '@nosgestesclimat/core/features/auth/services/decrypt-session.service'
import { rotateSession } from '@nosgestesclimat/core/features/auth/services/rotate-session.service'

import logger from '@/logger/logger.server'
import type {
  Session,
  SessionTokens,
} from '@nosgestesclimat/core/features/auth/types/session'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import { type NextRequest, NextResponse } from 'next/server'
import type { MiddlewareResult } from './types'

/** Auth middleware: decrypts session, validates, silently rotates expired
 * tokens. Returns a redirect or cookies for the final response. */
export async function middlewareAuth(
  request: NextRequest
): Promise<MiddlewareResult> {
  const middlewareLogger = logger.child({ scope: 'site.middleware.auth' })
  const sessionCookie = request.cookies.get(SESSION_COOKIE)

  // (A) No session cookie: anonymous user.
  if (!sessionCookie) {
    return { redirect: null, cookies: [] }
  }

  let payload: Session
  try {
    payload = await decryptSession(sessionCookie.value)
  } catch (err) {
    // (B) Corrupted or tampered session cookie: log and treat as anonymous.
    middlewareLogger.warn(toError(err))
    return { redirect: null, cookies: deleteSessionCookies() }
  }

  if (!isSessionExpired(payload)) {
    request.headers.set(
      'x-session',
      JSON.stringify({ userId: payload.userId, email: payload.email })
    )
    // (C) Valid session. Forward user info downstream.
    // If a stale `_rt` param is present (leftover from a previous rotation),
    // strip it with a redirect to keep URLs clean.
    return stripRt(request)
  }

  const refreshCookie = request.cookies.get(REFRESH_COOKIE)
  if (!refreshCookie) {
    // (D) Expired session without a refresh cookie.
    // The user must log in again; log the event and continue anonymously.
    middlewareLogger.warn('Session expired but no refresh cookie present')
    return { redirect: null, cookies: deleteSessionCookies() }
  }

  let tokens: SessionTokens
  try {
    tokens = await rotateSession(refreshCookie.value, payload.email)
  } catch (err) {
    if (err instanceof TokenExpiredException) {
      // (E) Refresh token exists but is past its expiration.
      // The user must log in again; continue anonymously.
      return { redirect: null, cookies: deleteSessionCookies() }
    }

    if (err instanceof TokenConsumedException) {
      // Replay protection: the token was consumed by a concurrent request.
      // Retry up to 2 times with a short delay to let the winner commit.
      const url = request.nextUrl.clone()
      const rtCount = parseInt(url.searchParams.get('_rt') ?? '0', 10) + 1

      if (rtCount <= 2) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        url.searchParams.set('_rt', String(rtCount))
        return { redirect: NextResponse.redirect(url), cookies: [] }
      }

      // Replay limit exceeded.  The rotation never completed;
      // log and continue anonymously.
      middlewareLogger.warn(
        `Session rotation replay limit exceeded after ${rtCount} attempts`
      )
      return {
        redirect: null,
        cookies: deleteSessionCookies(),
      }
    }

    // (G) Unknown error during rotation — log and continue anonymously.
    middlewareLogger.error(toError(err))
    return { redirect: null, cookies: deleteSessionCookies() }
  }

  // (H) Fresh tokens obtained. Return the new session + refresh
  // cookies to be applied in the post-routing phase.
  request.headers.set(
    'x-session',
    JSON.stringify({ userId: payload.userId, email: payload.email })
  )
  return {
    redirect: null,
    cookies: buildSessionCookies(tokens),
  }
}

/** Strips the `_rt` replay-tracking param from URLs where rotation already
 * completed, keeping URLs clean. */
function stripRt(request: NextRequest): MiddlewareResult {
  if (!request.nextUrl.searchParams.has('_rt')) {
    return { redirect: null, cookies: [] }
  }

  const cleanUrl = request.nextUrl.clone()
  cleanUrl.searchParams.delete('_rt')
  return { redirect: NextResponse.redirect(cleanUrl), cookies: [] }
}
