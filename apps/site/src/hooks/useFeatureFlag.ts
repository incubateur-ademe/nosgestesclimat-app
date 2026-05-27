'use client'

import { FF_COOKIE_NAME } from '@/services/feature-flags/constants'
import type { FeatureFlagName } from '@/services/feature-flags/flags'
import { parseFeatureFlagCookie } from '@/services/feature-flags/urlParams'
import { getClientCookie } from '@/utils/cookie'
import posthog from 'posthog-js'
import { useEffect, useState } from 'react'

type VariantFlagResult = string | boolean | undefined

function resolveFlagValue(
  flag: FeatureFlagName
): VariantFlagResult {
  const raw = getClientCookie(FF_COOKIE_NAME)
  const overrides = parseFeatureFlagCookie(raw)
  if (flag in overrides) return overrides[flag]
  return posthog?.getFeatureFlag(flag)
}

export function useFeatureFlag(
  flag: 'actions-v2'
): boolean | undefined
export function useFeatureFlag(
  flag: 'mode-scolaire'
): boolean | undefined
export function useFeatureFlag(
  flag: 'ab-test-tranche'
): 'control' | 'test' | undefined
export function useFeatureFlag(
  flag: FeatureFlagName
): VariantFlagResult
export function useFeatureFlag(
  flag: FeatureFlagName
): VariantFlagResult {
  const [value, setValue] = useState<VariantFlagResult>(() =>
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
