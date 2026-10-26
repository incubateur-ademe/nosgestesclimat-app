import { REFRESH_TOKEN_TTL_DAYS } from '@nosgestesclimat/core/features/auth/constants/session'
import { getCookieOptions } from './helpers'
import type { CookieToSet } from './types'

export const SESSION_COOKIE = 'ngc_session'
export const REFRESH_COOKIE = 'ngc_refresh'

// maxAge of BOTH the session and refresh cookies (they share the refresh
// token's lifetime).
export const AUTH_COOKIE_MAX_AGE = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60

/**
 * A renewal that found its key already rotated has nothing to install, and
 * writing the value it holds would overwrite the one the rotation stored.
 */
export function buildSessionCookies(tokens: {
  accessToken: string
  refreshToken?: string
}): CookieToSet[] {
  const maxAge = AUTH_COOKIE_MAX_AGE
  const options = getCookieOptions()
  const cookies: CookieToSet[] = [
    {
      name: SESSION_COOKIE,
      value: tokens.accessToken,
      options: { ...options, maxAge },
    },
  ]

  if (tokens.refreshToken) {
    cookies.push({
      name: REFRESH_COOKIE,
      value: tokens.refreshToken,
      options: { ...options, maxAge },
    })
  }

  return cookies
}

export function deleteSessionCookies(): CookieToSet[] {
  return [
    {
      name: SESSION_COOKIE,
      value: '',
      options: { ...getCookieOptions(), maxAge: 0 },
    },
    {
      name: REFRESH_COOKIE,
      value: '',
      options: { ...getCookieOptions(), maxAge: 0 },
    },
  ]
}
