import {
  buildSessionCookies,
  deleteSessionCookies,
  REFRESH_COOKIE,
} from '@/helpers/server/cookie/auth.cookie'
import { TokenConsumedException } from '@nosgestesclimat/core/features/auth/exceptions/token-consumed.exception'
import { TokenExpiredException } from '@nosgestesclimat/core/features/auth/exceptions/token-expired.exception'
import { rotateSession } from '@nosgestesclimat/core/features/auth/services/rotate-session.service'
import type { SessionTokens } from '@nosgestesclimat/core/features/auth/types/session'
import { captureException } from '@sentry/nextjs'
import { type NextRequest, NextResponse } from 'next/server'
import { readSession, setSessionHeader } from './session-header'
import type { MiddlewareResult } from './types'

/**
 * Auth interceptor middleware.
 *
 * Decrypts the session cookie, validates it, and if expired attempts a
 * silent refresh-token rotation. Returns either a redirect (to retry rotation
 * or strip stale query params) or the cookies to set on the final response.
 */
export async function middlewareAuth(
  request: NextRequest
): Promise<MiddlewareResult> {
  const session = await readSession(request)

  // (A) No session cookie: anonymous user.
  if (session.status === 'absent') {
    return { redirect: null, cookies: [] }
  }

  // (B) Corrupted or tampered session cookie: log and treat as anonymous.
  if (session.status === 'invalid') {
    captureException(session.error)
    return { redirect: null, cookies: deleteSessionCookies() }
  }

  const { payload } = session

  if (session.status === 'valid') {
    setSessionHeader(request, payload)
    // (C) Valid session. Forward user info downstream.
    // If a stale `_rt` param is present (leftover from a previous rotation),
    // strip it with a redirect to keep URLs clean.
    return stripRt(request)
  }

  const refreshCookie = request.cookies.get(REFRESH_COOKIE)
  if (!refreshCookie) {
    // (D) Expired session without a refresh cookie.
    // The user must log in again; log the event and continue anonymously.
    captureException(
      new Error('Session expired but no refresh cookie present'),
      { level: 'error' }
    )
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
      //
      // (F) Replay-protection loop: the token was already consumed
      // by a concurrent request that won the race.  `_rt` tracks
      // how many times we've retried.  Up to 2 redirects before
      // giving up — this gives the winner enough time to commit
      // its new tokens.
      //
      const url = request.nextUrl.clone()
      const rtCount = parseInt(url.searchParams.get('_rt') ?? '0', 10) + 1

      if (rtCount <= 2) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        url.searchParams.set('_rt', String(rtCount))
        return { redirect: NextResponse.redirect(url), cookies: [] }
      }

      // Replay limit exceeded.  The rotation never completed;
      // log and continue anonymously.
      captureException(
        new Error(
          `Session rotation replay limit exceeded after ${rtCount} attempts`
        ),
        { level: 'error' }
      )
      return {
        redirect: null,
        cookies: deleteSessionCookies(),
      }
    }

    // (G) Unknown error during rotation — log and continue anonymously.
    captureException(err, { level: 'error' })
    return { redirect: null, cookies: deleteSessionCookies() }
  }

  // (H) Fresh tokens obtained. Return the new session + refresh
  // cookies to be applied in the post-routing phase.
  setSessionHeader(request, payload)
  return {
    redirect: null,
    cookies: buildSessionCookies(tokens),
  }
}

/**
 * Clean up the `_rt` replay-tracking parameter from the URL.
 *
 * When a URL still carries `_rt` but the session is now valid (rotation
 * completed successfully in a previous request), we redirect to the same
 * URL without the stale parameter to keep URLs clean and avoid
 * accumulating clutter in analytics / bookmarks.
 */
function stripRt(request: NextRequest): MiddlewareResult {
  if (!request.nextUrl.searchParams.has('_rt')) {
    return { redirect: null, cookies: [] }
  }

  const cleanUrl = request.nextUrl.clone()
  cleanUrl.searchParams.delete('_rt')
  return { redirect: NextResponse.redirect(cleanUrl), cookies: [] }
}
