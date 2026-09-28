import { getPersonalizedActionDetails as _getPersonalizedActionDetails } from '@nosgestesclimat/core/features/actions/services/get-personalized-action-details.service'
import { cacheLife, cacheTag } from 'next/cache'

export const GET_PERSONALIZED_ACTION_DETAILS = 'get_personalized_action_details'

export async function getPersonalizedActionDetails(
  ...args: Parameters<typeof _getPersonalizedActionDetails>
) {
  'use cache'
  cacheLife('minutes')
  cacheTag(GET_PERSONALIZED_ACTION_DETAILS)
  return await _getPersonalizedActionDetails(...args)
}
