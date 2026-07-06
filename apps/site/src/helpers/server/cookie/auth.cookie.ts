import { REFRESH_TOKEN_TTL_DAYS } from '@nosgestesclimat/core/features/auth/constants/session'
import type { SessionTokens } from '@nosgestesclimat/core/features/auth/types/session'
import { getCookieOptions } from './helpers'
import type { CookieToSet } from './types'

export const SESSION_COOKIE = 'ngc_session'
export const REFRESH_COOKIE = 'ngc_refresh'

export function buildSessionCookies(tokens: SessionTokens): CookieToSet[] {
  const maxAge = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60
  const options = getCookieOptions()
  return [
    {
      name: SESSION_COOKIE,
      value: tokens.accessToken,
      options: { ...options, maxAge },
    },
    {
      name: REFRESH_COOKIE,
      value: tokens.refreshToken,
      options: { ...options, maxAge },
    },
  ]
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
