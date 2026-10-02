import type { PartnerCampaignType } from '@/adapters/cmsClient'
import { cmsClient } from '@/adapters/cmsClient'
import { type Locale } from '@/i18nConfig'
import logger from '@/logger/logger.server'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import { cacheLife } from 'next/cache'

export async function fetchPartnerCampaign({
  locale,
  pollSlug,
}: {
  locale: Locale
  pollSlug: string
}): Promise<PartnerCampaignType | null> {
  'use cache'
  cacheLife('hours')

  try {
    const partnerCampaignSearchParams = new URLSearchParams({
      locale,
      'filters[pollSlug][$eq]': pollSlug,
      'populate[0]': 'logo',
      'populate[1]': 'image',
      'populate[2]': 'faq.questions',
    })

    const partnerCampaignsResponse = await cmsClient<{
      data: PartnerCampaignType[]
    }>(`/api/landing-campaigns?${partnerCampaignSearchParams}`)

    return partnerCampaignsResponse.data[0]
  } catch (error) {
    logger.warn(toError(error), { scope: 'site.action.fetchPartnerCampaign' })

    return null
  }
}
