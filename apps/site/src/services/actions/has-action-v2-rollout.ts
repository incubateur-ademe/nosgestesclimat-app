import { getPersonalizedActionsCatalogue } from '@/services/actions/get-personalized-actions-catalogue'
import type { ISOSupportedLanguage } from '@nosgestesclimat/core/features/geo/types/language'
import { getFeatureFlag } from '../feature-flags/getFeatureFlag'

export async function hasActionV2Rollout(
  userId: string,
  locale: ISOSupportedLanguage
): Promise<boolean> {
  const { assessmentStatus } = await getPersonalizedActionsCatalogue(
    userId,
    locale // necessary in order to ensure cache hit
  )
  if (assessmentStatus === null || assessmentStatus === 'failed') {
    return false
  }
  const flag = await getFeatureFlag('actions-v2', userId)
  return flag === true
}
