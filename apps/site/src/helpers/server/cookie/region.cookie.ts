import type { Region } from '@/helpers/server/model/models'

export const REGION_COOKIE = 'ngc_region'

export function buildRegionCookie(region: Region, initial?: Region) {
  return JSON.stringify({ current: region, initial: initial ?? region })
}
