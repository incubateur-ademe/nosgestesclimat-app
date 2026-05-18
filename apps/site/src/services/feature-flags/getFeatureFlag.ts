import { posthogClient } from '@/services/tracking/posthogServer'
import { cookies } from 'next/headers'
import { FF_COOKIE_NAME } from './constants'
import type { FeatureFlagName } from './flags'
import { parseFeatureFlagCookie } from './urlParams'

export async function getFeatureFlag(
  flag: FeatureFlagName,
  userId: string
): Promise<string | boolean | undefined> {
  const cookieStore = await cookies()
  const overrides = parseFeatureFlagCookie(
    cookieStore.get(FF_COOKIE_NAME)?.value
  )
  if (flag in overrides) return overrides[flag]
  return posthogClient.getFeatureFlag(flag, userId)
}
