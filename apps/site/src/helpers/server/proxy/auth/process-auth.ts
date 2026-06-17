import { type NextRequest, NextResponse } from 'next/server'
import { captureException } from '@sentry/nextjs'
import { decryptSession } from '@nosgestesclimat/core/features/auth/services/decrypt-session.service'
import { isSessionExpired } from '@nosgestesclimat/core/features/auth/helpers/is-session-expired'
import { rotateSession } from '@nosgestesclimat/core/features/auth/services/rotate-session.service'
import { TokenExpiredException } from '@nosgestesclimat/core/features/auth/exceptions/token-expired.exception'
import { TokenConsumedException } from '@nosgestesclimat/core/features/auth/exceptions/token-consumed.exception'
import type { SessionPayload } from '@nosgestesclimat/core/features/auth/types/session'
import {
  SESSION_COOKIE,
  REFRESH_COOKIE,
  SESSION_MAX_AGE,
  REFRESH_MAX_AGE,
} from './cookies'
import { getCookieOptions } from '../cookies'
import type { MiddlewareResult } from '../types'

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

  // Case A — No session cookie: anonymous user, nothing to do.
  if (!sessionCookie) {
    return { redirect: null, cookies: [] }
  }

  let payload: SessionPayload | null = null
  try {
    payload = await decryptSession(sessionCookie.value)
  } catch {
    // Case B — Corrupted or tampered session cookie: treat as anonymous.
    return { redirect: null, cookies: [] }
  }
  if (!payload) {
    return { redirect: null, cookies: [] }
  }

  // ── Session is still valid ──

  if (!isSessionExpired(payload)) {
    request.headers.set(
      'x-session',
      JSON.stringify({ userId: payload.userId, email: payload.email })
    )
    // Case C — Valid session. Forward user info downstream.
    // If a stale `_rt` param is present (leftover from a previous rotation
    // loop), strip it with a redirect to keep URLs clean.
    return stripRt(request)
  }

  // ── Session expired, try refresh token rotation ──

  const refreshCookie = request.cookies.get(REFRESH_COOKIE)
  if (!refreshCookie) {
    // Case D — Expired session without a refresh cookie.
    // The user must log in again; log the event and continue anonymously.
    captureException(
      new Error('Session expired but no refresh cookie present'),
      { level: 'error' }
    )
    return { redirect: null, cookies: [] }
  }

  let tokens: Awaited<ReturnType<typeof rotateSession>>
  try {
    tokens = await rotateSession(refreshCookie.value, payload.email)
  } catch (err) {
    if (err instanceof TokenExpiredException) {
      // Case D2 — Token exists but is past its expiration date.
      // Silent failure: the user must log in again.
      return { redirect: null, cookies: [] }
    }

    if (err instanceof TokenConsumedException) {
      //
      // Case E — Token already consumed (concurrent-request race).
      // Replay-protection loop:  `_rt` tracks how many times we've
      // retried.  We allow up to 2 redirects before giving up — this
      // gives the eventual winner time to commit its new tokens.
      //
      const url = request.nextUrl.clone()
      const rtCount = parseInt(url.searchParams.get('_rt') ?? '0', 10) + 1

      if (rtCount <= 2) {
        url.searchParams.set('_rt', String(rtCount))
        return { redirect: NextResponse.redirect(url), cookies: [] }
      }

      // Case F — Replay limit exceeded.  The rotation never completed;
      // log the error and continue anonymously.
      captureException(
        new Error(
          `Session rotation replay limit exceeded after ${rtCount} attempts`
        ),
        { level: 'error' }
      )
      return { redirect: null, cookies: [] }
    }

    // Unknown error during rotation — log and continue anonymously.
    captureException(err, { level: 'error' })
    return { redirect: null, cookies: [] }
  }

  // ── Rotation succeeded ──

  request.headers.set(
    'x-session',
    JSON.stringify({ userId: payload.userId, email: payload.email })
  )

  // Case G — Fresh tokens obtained.  Return the new session + refresh
  // cookies to be applied in the post-routing phase.
  return {
    redirect: null,
    cookies: [
      {
        name: SESSION_COOKIE,
        value: tokens.accessToken,
        options: { ...getCookieOptions(), maxAge: SESSION_MAX_AGE },
      },
      {
        name: REFRESH_COOKIE,
        value: tokens.refreshToken,
        options: { ...getCookieOptions(), maxAge: REFRESH_MAX_AGE },
      },
    ],
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
