import { getCookieOptions } from '@/helpers/server/cookie/helpers'
import {
  buildRegionCookie,
  REGION_COOKIE,
} from '@/helpers/server/cookie/region.cookie'
import type { Region } from '@/helpers/server/model/models'
import {
  RegionDataSchema,
  type RegionData,
} from '@nosgestesclimat/core/features/region/region.schema'
import { cookies, headers } from 'next/headers'
import { safeParse } from 'valibot'

export async function getRegion(): Promise<RegionData | undefined> {
  const headerStore = await headers()
  const value = headerStore.get('x-region')
  if (!value) return undefined
  try {
    const json = JSON.parse(value)
    const result = safeParse(RegionDataSchema, json)
    return result.success ? result.output : undefined
  } catch {
    return undefined
  }
}

export async function setRegion(region: Region): Promise<void> {
  const cookieStore = await cookies()
  const current = await getRegion()
  cookieStore.set(
    REGION_COOKIE,
    buildRegionCookie(region, current?.initial),
    getCookieOptions()
  )
}
