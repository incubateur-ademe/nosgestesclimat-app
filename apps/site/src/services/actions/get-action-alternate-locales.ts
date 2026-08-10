import { getActionAlternateLocales as _getActionAlternateLocales } from '@nosgestesclimat/core/features/actions/services/get-action-alternate-locales.service'
import { cacheLife } from 'next/cache'

export async function getActionAlternateLocales(
  ...args: Parameters<typeof _getActionAlternateLocales>
) {
  'use cache'
  cacheLife('minutes')
  return await _getActionAlternateLocales(...args)
}
