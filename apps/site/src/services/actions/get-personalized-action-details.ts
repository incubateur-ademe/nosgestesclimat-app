import { getPersonalizedActionDetails as _getPersonalizedActionDetails } from '@nosgestesclimat/core/features/actions/services/get-personalized-action-details.service'
import { cacheLife, cacheTag } from 'next/cache'

export const GET_PERSONALIZED_ACTION_DETAILS_CACHE_TAG_PREFIX =
  'get_personalized_action_details'

export const getPersonalizedActionDetailsCacheTagWithSlug = (slug: string) =>
  `${GET_PERSONALIZED_ACTION_DETAILS_CACHE_TAG_PREFIX}-${slug}`

export async function getPersonalizedActionDetails(
  ...args: Parameters<typeof _getPersonalizedActionDetails>
) {
  'use cache'
  cacheLife('minutes')
  cacheTag(getPersonalizedActionDetailsCacheTagWithSlug(args[0]))
  return await _getPersonalizedActionDetails(...args)
}
