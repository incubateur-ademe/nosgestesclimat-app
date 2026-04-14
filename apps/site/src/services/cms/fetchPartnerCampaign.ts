import type { PartnerCampaignType } from '@/adapters/cmsClient'
import { cmsClient } from '@/adapters/cmsClient'
import { type Locale } from '@/i18nConfig'
import { captureException } from '@sentry/nextjs'

export async function fetchPartnerCampaign({
  locale,
  pollSlug,
}: {
  locale: Locale
  pollSlug: string
}): Promise<PartnerCampaignType | null> {
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
    captureException(error)

    return null
  }
}
