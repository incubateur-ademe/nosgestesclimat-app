import type { FAQType } from '@/adapters/cmsClient'
import { cmsClient } from '@/adapters/cmsClient'
import { type Locale } from '@/i18nConfig'
import { captureException } from '@sentry/nextjs'

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
    captureException(error)

    return null
  }
}
