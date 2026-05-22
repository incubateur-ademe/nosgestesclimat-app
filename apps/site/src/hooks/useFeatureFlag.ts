'use client'

import { FF_COOKIE_NAME } from '@/services/feature-flags/constants'
import type { FeatureFlagName } from '@/services/feature-flags/flags'
import { parseFeatureFlagCookie } from '@/services/feature-flags/urlParams'
import { getClientCookie } from '@/utils/cookie'
import posthog from 'posthog-js'
import { useEffect, useState } from 'react'

function resolveFlagValue(flag: FeatureFlagName): boolean | undefined {
  const raw = getClientCookie(FF_COOKIE_NAME)
  const overrides = parseFeatureFlagCookie(raw)
  if (flag in overrides) return overrides[flag]
  return posthog?.isFeatureEnabled(flag)
}

export function useFeatureFlag(flag: FeatureFlagName): boolean | undefined {
  const [value, setValue] = useState<boolean | undefined>(() =>
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
