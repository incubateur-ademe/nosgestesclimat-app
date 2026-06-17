import type { NextRequest } from 'next/server'
import type { UserRegion } from '@/helpers/server/model/models'
import { getRegionFromSearchParams } from '@/helpers/server/dal/_helpers/getRegionFromParams'
import { getCookieOptions } from '@/helpers/server/proxy/cookies'
import type { MiddlewareResult } from './types'

export const REGION_COOKIE = 'ngc_region'

export function buildRegionCookie(region: UserRegion, initial?: UserRegion) {
  return JSON.stringify({ current: region, initial: initial ?? region })
}

export function middlewareRegion(request: NextRequest): MiddlewareResult {
  const forcedRegion = getRegionFromSearchParams(request.nextUrl.searchParams)
  if (!forcedRegion) return { redirect: null, cookies: [] }

  const existing = request.cookies.get(REGION_COOKIE)?.value
  let initial: UserRegion | undefined
  if (existing) {
    try {
      const parsed = JSON.parse(existing)
      initial = parsed.initial
    } catch {
      // ignore malformed cookie
    }
  }

  return {
    redirect: null,
    cookies: [
      {
        name: REGION_COOKIE,
        value: buildRegionCookie(forcedRegion, initial),
        options: getCookieOptions(),
      },
    ],
  }
}
