import { getPersonalizedActionsCatalogue } from '@/services/actions/get-personalized-actions-catalogue'
import { getFeatureFlag } from '../feature-flags/getFeatureFlag'

export async function hasActionV2Rollout(userId: string): Promise<boolean> {
  const { assessmentStatus } = await getPersonalizedActionsCatalogue(userId)
  if (assessmentStatus === null || assessmentStatus === 'failed') {
    return false
  }
  const flag = await getFeatureFlag('actions-v2', userId)
  return flag === true
}
