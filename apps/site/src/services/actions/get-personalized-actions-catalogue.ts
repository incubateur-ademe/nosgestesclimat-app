import { getPersonalizedActionsCatalogue as _getPersonalizedActionsCatalogue } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import { cacheLife } from 'next/cache'

export async function getPersonalizedActionsCatalogue(
  ...args: Parameters<typeof _getPersonalizedActionsCatalogue>
) {
  'use cache'
  cacheLife('minutes')
  return await _getPersonalizedActionsCatalogue(...args)
}
