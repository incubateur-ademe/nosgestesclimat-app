import type { BannerType } from '@/adapters/cmsClient'
import { cmsClient } from '@/adapters/cmsClient'
import { type Locale } from '@/i18nConfig'
import { captureException } from '@sentry/nextjs'
import dayjs from 'dayjs'

export async function fetchBanner(locale: Locale): Promise<BannerType | null> {
  try {
    const currentDate = dayjs()

    const bannerSearchParams = new URLSearchParams({
      locale,
      sort: 'startDate:desc',
      // Get the banner for the current date ; the date needs to be between the start and end date
      'filters[$and][0][startDate][$lte]': currentDate
        .endOf('day')
        .toISOString(),
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
    captureException(error)

    return null
  }
}
