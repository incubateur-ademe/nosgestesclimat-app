import { getPublicActionsCatalogue as _getPublicActionsCatalogue } from '@nosgestesclimat/core/features/actions/services/get-public-actions-catalogue.service'
import { cacheLife } from 'next/cache'

export async function getPublicActionsCatalogue(
  ...args: Parameters<typeof _getPublicActionsCatalogue>
) {
  'use cache'
  cacheLife('minutes')
  return await _getPublicActionsCatalogue(...args)
}
