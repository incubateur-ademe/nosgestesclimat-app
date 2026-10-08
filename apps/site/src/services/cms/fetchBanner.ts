import type { BannerType } from '@/adapters/cmsClient'
import { cmsClient } from '@/adapters/cmsClient'
import { type Locale } from '@/i18nConfig'
import _logger from '@/logger/logger.server'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import dayjs from 'dayjs'
import { cacheLife } from 'next/cache'

export async function fetchBanner(locale: Locale): Promise<BannerType | null> {
  'use cache'
  cacheLife('days')

  const logger = _logger.child({ scope: 'site.action.fetchBanner', locale })

  try {
    const currentDate = dayjs()

    const bannerSearchParams = new URLSearchParams({
      locale,
      sort: 'startDate:desc',
      // Get the banner for the current date ; the date needs to be between the start and end date
      'filters[$and][0][startDate][$lte]': currentDate.toISOString(),
      'filters[$and][1][endDate][$gte]': currentDate
        .startOf('day')
        .toISOString(),
      'pagination[limit]': '1',
      populate: '*',
    })

    const bannersResponse = await cmsClient<{ data: BannerType[] }>(
      `/api/banners?${bannerSearchParams}`
    )

    return bannersResponse.data[0]
  } catch (error) {
    logger.warn(toError(error))

    return null
  }
}
