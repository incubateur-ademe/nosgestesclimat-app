import type { FAQType } from '@/adapters/cmsClient'
import { cmsClient } from '@/adapters/cmsClient'
import { type Locale } from '@/i18nConfig'
import logger from '@/logger/logger.server'
import { toError } from '@nosgestesclimat/core/lib/to-error'

export async function fetchFaq({
  locale,
}: {
  locale: Locale
}): Promise<FAQType[] | null> {
  try {
    const faqSearchParams = new URLSearchParams({
      locale,
      sort: 'faqs.order',
      populate: 'faqs.questions',
    })

    const faqResponse = await cmsClient<{ data: { faqs: FAQType[] } }>(
      `/api/faq-page?${faqSearchParams}`
    )

    return faqResponse.data.faqs
  } catch (error) {
    logger.warn(toError(error), { scope: 'site.action.fetchFaq' })

    return null
  }
}
