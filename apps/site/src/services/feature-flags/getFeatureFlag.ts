import { posthogClient } from '@/services/tracking/posthogServer'
import { cookies } from 'next/headers'
import { FF_COOKIE_NAME } from './constants'
import type { FeatureFlagName, FeatureFlagValue } from './flags'
import { parseFeatureFlagCookie } from './urlParams'

type Maybe<T> = T | undefined

export async function getFeatureFlag<K extends FeatureFlagName>(
  flag: K,
  userId: string
): Promise<Maybe<FeatureFlagValue<K>>> {
  const cookieStore = await cookies()
  const overrides = parseFeatureFlagCookie(
    cookieStore.get(FF_COOKIE_NAME)?.value
  )
  if (flag in overrides) return overrides[flag] as FeatureFlagValue<K>
  return (await posthogClient.getFeatureFlag(flag, userId)) as Maybe<
    FeatureFlagValue<K>
  >
}
