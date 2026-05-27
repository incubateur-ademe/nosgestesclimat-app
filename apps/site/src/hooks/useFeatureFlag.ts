'use client'

import { FF_COOKIE_NAME } from '@/services/feature-flags/constants'
import type { FeatureFlagName, FeatureFlagValue } from '@/services/feature-flags/flags'
import { parseFeatureFlagCookie } from '@/services/feature-flags/urlParams'
import { getClientCookie } from '@/utils/cookie'
import posthog from 'posthog-js'
import { useEffect, useState } from 'react'

function resolveFlagValue<K extends FeatureFlagName>(
  flag: K
): FeatureFlagValue<K> | undefined {
  const raw = getClientCookie(FF_COOKIE_NAME)
  const overrides = parseFeatureFlagCookie(raw)
  if (flag in overrides) return overrides[flag] as FeatureFlagValue<K>
  return posthog?.getFeatureFlag(flag) as FeatureFlagValue<K> | undefined
}

export function useFeatureFlag<K extends FeatureFlagName>(
  flag: K
): FeatureFlagValue<K> | undefined {
  const [value, setValue] = useState<FeatureFlagValue<K> | undefined>(() =>
    resolveFlagValue(flag)
  )

  useEffect(() => {
    const unsubscribe = posthog?.onFeatureFlags(() =>
      setValue(resolveFlagValue(flag))
    )
    return () => {
      unsubscribe?.()
    }
  }, [flag])

  return value
}
