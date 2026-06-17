import { type NextRequest, NextResponse } from 'next/server'
import { captureException } from '@sentry/nextjs'
import { decryptSession } from '@nosgestesclimat/core/features/auth/services/decrypt-session.service'
import { isSessionExpired } from '@nosgestesclimat/core/features/auth/helpers/is-session-expired'
import { rotateSession } from '@nosgestesclimat/core/features/auth/services/rotate-session.service'
import {
  SESSION_COOKIE,
  REFRESH_COOKIE,
  SESSION_MAX_AGE,
  REFRESH_MAX_AGE,
} from './cookies'
import { getCookieOptions } from '../cookies'
import type { MiddlewareResult, CookieToSet } from '../types'

const noCookies: CookieToSet[] = []

export async function middlewareAuth(request: NextRequest): Promise<MiddlewareResult> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE)

  if (!sessionCookie) {
    return { redirect: null, cookies: noCookies }
  }

  let payload: Awaited<ReturnType<typeof decryptSession>>
  try {
    payload = await decryptSession(sessionCookie.value)
  } catch {
    return { redirect: null, cookies: noCookies }
  }

  if (!payload) {
    return { redirect: null, cookies: noCookies }
  }

  if (!isSessionExpired(payload)) {
    request.headers.set(
      'x-session',
      JSON.stringify({ userId: payload.userId, email: payload.email })
    )
    return stripRt(request)
  }

  const refreshCookie = request.cookies.get(REFRESH_COOKIE)
  if (!refreshCookie) {
    captureException(
      new Error('Session expired but no refresh cookie present'),
      { level: 'error' }
    )
    return { redirect: null, cookies: noCookies }
  }

  const tokens = await rotateSession(refreshCookie.value, payload.email)

  if (!tokens) {
    const url = request.nextUrl.clone()
    const rtCount = parseInt(url.searchParams.get('_rt') ?? '0', 10) + 1

    if (rtCount <= 2) {
      url.searchParams.set('_rt', String(rtCount))
      return { redirect: NextResponse.redirect(url), cookies: noCookies }
    }

    captureException(
      new Error(`Session rotation replay limit exceeded after ${rtCount} attempts`),
      { level: 'error' }
    )
    return { redirect: null, cookies: noCookies }
  }

  request.headers.set(
    'x-session',
    JSON.stringify({ userId: payload.userId, email: payload.email })
  )

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

function stripRt(request: NextRequest): MiddlewareResult {
  if (!request.nextUrl.searchParams.has('_rt')) {
    return { redirect: null, cookies: noCookies }
  }

  const cleanUrl = request.nextUrl.clone()
  cleanUrl.searchParams.delete('_rt')
  return { redirect: NextResponse.redirect(cleanUrl), cookies: noCookies }
}
