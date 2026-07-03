import { getCookieOptions } from '@/helpers/server/cookie/helpers'
import {
  buildRegionCookie,
  REGION_COOKIE,
} from '@/helpers/server/cookie/region.cookie'
import type { Region } from '@/helpers/server/model/models'
import { supportedRegions } from '@/helpers/server/model/models'
import { getGeolocation } from '@/services/geolocation/get-geolocation'
import type { NextRequest } from 'next/server'
import type { MiddlewareResult } from './types'

export async function middlewareRegion(
  request: NextRequest
): Promise<MiddlewareResult> {
  const existingValue = request.cookies.get(REGION_COOKIE)?.value
  let region: Region | undefined
  let initial: Region | undefined

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

  const cookieValue = buildRegionCookie(region, initial)

  request.headers.set('x-region', cookieValue)

  if (existingValue === cookieValue) {
    return { redirect: null, cookies: [] }
  }

  return {
    redirect: null,
    cookies: [
      {
        name: REGION_COOKIE,
        value: cookieValue,
        options: getCookieOptions(),
      },
    ],
  }
}

function getRegionFromSearchParams(
  searchParams: URLSearchParams
): Region | null {
  if (!searchParams.has('region')) return null
  const region = searchParams.get('region')
  if (region && region in supportedRegions) {
    return region as Region
  }
  return null
}
