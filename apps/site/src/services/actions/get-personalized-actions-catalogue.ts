import { getPersonalizedActionsCatalogue as _getPersonalizedActionsCatalogue } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import { cacheLife, cacheTag } from 'next/cache'

export const GET_PERSONALIZED_ACTIONS_CACHE_TAG = 'get_personalized_actions'

export async function getPersonalizedActionsCatalogue(
  ...args: Parameters<typeof _getPersonalizedActionsCatalogue>
) {
  'use cache'
  cacheLife('minutes')
  cacheTag(GET_PERSONALIZED_ACTIONS_CACHE_TAG)

  return await _getPersonalizedActionsCatalogue(...args)
}
