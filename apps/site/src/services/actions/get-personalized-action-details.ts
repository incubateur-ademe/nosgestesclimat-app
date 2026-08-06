import { getPersonalizedActionDetails as _getPersonalizedActionDetails } from '@nosgestesclimat/core/features/actions/services/get-personalized-action-details.service'
import { cacheLife } from 'next/cache'

export async function getPersonalizedActionDetails(
  ...args: Parameters<typeof _getPersonalizedActionDetails>
) {
  'use cache'
  cacheLife('minutes')
  return await _getPersonalizedActionDetails(...args)
}
