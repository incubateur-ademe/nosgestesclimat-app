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
import { toError } from '@nosgestesclimat/core/lib/to-error'
import { cookies, headers } from 'next/headers'
import { safeParse } from 'valibot'

import logger from '@/logger/logger.server'

export async function getRegion(): Promise<RegionData | undefined> {
  const headerStore = await headers()
  const value = headerStore.get('x-region')
  if (!value) return undefined
  try {
    const json = JSON.parse(value)
    const result = safeParse(RegionDataSchema, json)
    if (!result.success) {
      logger.warn('Unreadable x-region header', {
        scope: 'site.action.getRegion',
      })
      return undefined
    }
    return result.output
  } catch (error) {
    logger.warn(toError(error), { scope: 'site.action.getRegion' })
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
