import { cookies } from 'next/headers'
import type { UserRegion } from '@/helpers/server/model/models'
import { getCookieOptions } from '@/helpers/server/proxy/cookies'
import { buildRegionCookie, REGION_COOKIE } from '@/helpers/server/proxy/region'

interface RegionCookie {
  current: UserRegion
  initial: UserRegion
}

export async function getRegion(): Promise<RegionCookie | undefined> {
  const cookieStore = await cookies()
  const value = cookieStore.get(REGION_COOKIE)?.value
  if (!value) return undefined
  try {
    const parsed = JSON.parse(value)
    return parsed as RegionCookie
  } catch {
    return undefined
  }
}

export async function setRegion(region: UserRegion): Promise<void> {
  const cookieStore = await cookies()
  const current = await getRegion()
  cookieStore.set(
    REGION_COOKIE,
    buildRegionCookie(region, current?.initial),
    getCookieOptions()
  )
}
