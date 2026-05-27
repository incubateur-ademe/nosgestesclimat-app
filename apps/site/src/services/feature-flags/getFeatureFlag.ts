import { posthogClient } from '@/services/tracking/posthogServer'
import { cookies } from 'next/headers'
import { FF_COOKIE_NAME } from './constants'
import type { FeatureFlagName } from './flags'
import { parseFeatureFlagCookie } from './urlParams'

type VariantFlagResult = string | boolean | undefined

export async function getFeatureFlag(
  flag: 'actions-v2',
  userId: string
): Promise<boolean | undefined>
export async function getFeatureFlag(
  flag: 'mode-scolaire',
  userId: string
): Promise<boolean | undefined>
export async function getFeatureFlag(
  flag: 'ab-test-tranche',
  userId: string
): Promise<'control' | 'test' | undefined>
export async function getFeatureFlag(
  flag: FeatureFlagName,
  userId: string
): Promise<VariantFlagResult>
export async function getFeatureFlag(
  flag: FeatureFlagName,
  userId: string
): Promise<VariantFlagResult> {
  const cookieStore = await cookies()
  const overrides = parseFeatureFlagCookie(
    cookieStore.get(FF_COOKIE_NAME)?.value
  )
  if (flag in overrides) return overrides[flag] as VariantFlagResult
  return posthogClient.getFeatureFlag(flag, userId)
}
