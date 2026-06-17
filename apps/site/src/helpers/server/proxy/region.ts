import type { NextRequest } from 'next/server'
import type { UserRegion } from '@/helpers/server/model/models'
import { DEFAULT_REGION } from '@/helpers/server/model/models'
import { getRegionFromSearchParams } from '@/helpers/server/dal/_helpers/getRegionFromParams'
import { getCookieOptions } from '@/helpers/server/proxy/cookies'
import type { MiddlewareResult } from './types'

export const REGION_COOKIE = 'ngc_region'

export function buildRegionCookie(region: UserRegion, initial?: UserRegion) {
  return JSON.stringify({ current: region, initial: initial ?? region })
}

export function middlewareRegion(request: NextRequest): MiddlewareResult {
  const forcedRegion = getRegionFromSearchParams(request.nextUrl.searchParams)

  if (forcedRegion) {
    return {
      redirect: null,
      cookies: [
        {
          name: REGION_COOKIE,
          value: buildRegionCookie(forcedRegion, readInitial(request)),
          options: getCookieOptions(),
        },
      ],
    }
  }

  // No forced region and no existing cookie: set the default region
  // so the app knows which model to use from the first request.
  if (!request.cookies.has(REGION_COOKIE)) {
    return {
      redirect: null,
      cookies: [
        {
          name: REGION_COOKIE,
          value: buildRegionCookie(DEFAULT_REGION),
          options: getCookieOptions(),
        },
      ],
    }
  }

  return { redirect: null, cookies: [] }
}

function readInitial(request: NextRequest): UserRegion | undefined {
  const existing = request.cookies.get(REGION_COOKIE)?.value
  if (!existing) return undefined
  try {
    const parsed = JSON.parse(existing)
    return parsed.initial
  } catch {
    return undefined
  }
}
