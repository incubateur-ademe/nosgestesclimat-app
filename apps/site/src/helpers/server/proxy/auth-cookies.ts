import { REFRESH_TOKEN_TTL_DAYS } from '@nosgestesclimat/core/features/auth/constants/session'
import type { SessionTokens } from '@nosgestesclimat/core/features/auth/types/session'
import type { CookieToSet } from './types'

const domain = new URL(process.env.NEXT_PUBLIC_SITE_URL!).hostname
const secure = domain !== 'localhost'

export const SESSION_COOKIE = 'ngc_session'
export const REFRESH_COOKIE = 'ngc_refresh'

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? ('none' as const) : ('lax' as const),
    partitioned: secure,
    path: '/',
    ...(secure ? { domain } : {}),
  }
}

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
