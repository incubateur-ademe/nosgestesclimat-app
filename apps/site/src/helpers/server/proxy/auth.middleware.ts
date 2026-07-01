import {
  buildSessionCookies,
  REFRESH_COOKIE,
  SESSION_COOKIE,
} from '@/helpers/server/cookies'
import { TokenConsumedException } from '@nosgestesclimat/core/features/auth/exceptions/token-consumed.exception'
import { TokenExpiredException } from '@nosgestesclimat/core/features/auth/exceptions/token-expired.exception'
import { isSessionExpired } from '@nosgestesclimat/core/features/auth/helpers/is-session-expired'
import { decryptSession } from '@nosgestesclimat/core/features/auth/services/decrypt-session.service'
import { rotateSession } from '@nosgestesclimat/core/features/auth/services/rotate-session.service'
import type {
  Session,
  SessionTokens,
} from '@nosgestesclimat/core/features/auth/types/session'
import { captureException } from '@sentry/nextjs'
import { type NextRequest, NextResponse } from 'next/server'
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
    captureException(err)
    return { redirect: null, cookies: [] }
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
    captureException(
      new Error('Session expired but no refresh cookie present'),
      { level: 'error' }
    )
    return { redirect: null, cookies: [] }
  }

  let tokens: SessionTokens
  try {
    tokens = await rotateSession(refreshCookie.value, payload.email)
  } catch (err) {
    if (err instanceof TokenExpiredException) {
      // (E) Refresh token exists but is past its expiration.
      // The user must log in again; continue anonymously.
      return { redirect: null, cookies: [] }
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
      return stripRt(request)
    }

    // (G) Unknown error during rotation — log and continue anonymously.
    captureException(err, { level: 'error' })
    return { redirect: null, cookies: [] }
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
