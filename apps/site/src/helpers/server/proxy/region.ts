import type { NextRequest } from 'next/server'
import type { UserRegion } from '@/helpers/server/model/models'
import {
  getGeolocation,
  supportedRegions,
} from '@/helpers/server/model/models'
import { getRegionFromSearchParams } from '@/helpers/server/dal/_helpers/getRegionFromParams'
import { getCookieOptions } from '@/helpers/server/proxy/cookies'
import type { MiddlewareResult } from './types'

export const REGION_COOKIE = 'ngc_region'

export function buildRegionCookie(region: UserRegion, initial?: UserRegion) {
  return JSON.stringify({ current: region, initial: initial ?? region })
}

export async function middlewareRegion(
  request: NextRequest
): Promise<MiddlewareResult> {
  const existingValue = request.cookies.get(REGION_COOKIE)?.value
  let region: UserRegion | undefined
  let initial: UserRegion | undefined

  if (existingValue) {
    try {
      const parsed = JSON.parse(existingValue)
      region = parsed.current
      initial = parsed.initial
    } catch {
      // ignore malformed cookie, will geolocate below
    }
  }

  if (!region || !(region in supportedRegions)) {
    region = await getGeolocation()
    initial = region
  }

  const forcedRegion = getRegionFromSearchParams(request.nextUrl.searchParams)
  if (forcedRegion) {
    region = forcedRegion
  }

  return {
    redirect: null,
    cookies: [
      {
        name: REGION_COOKIE,
        value: buildRegionCookie(region, initial),
        options: getCookieOptions(),
      },
    ],
  }
}
