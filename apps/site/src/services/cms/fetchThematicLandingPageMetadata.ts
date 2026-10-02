import { cmsClient, type ThematicLandingPage } from '@/adapters/cmsClient'
import i18nConfig from '@/i18nConfig'
import logger from '@/logger/logger.server'
import { toError } from '@nosgestesclimat/core/lib/to-error'

export async function fetchThematicLandingPageMetadata({
  landingPageSlug,
}: {
  landingPageSlug: string
}): Promise<
  | {
      thematicLandingPageMetadata?: ThematicLandingPage
    }
  | undefined
> {
  try {
    const thematicLPSearchParams = new URLSearchParams({
      locale: i18nConfig.defaultLocale,
      'populate[0]': 'metadata',
      'filters[slug][$eq]': landingPageSlug,
      sort: 'publishedAt:desc',
    })

    const thematicLPResponse = await cmsClient<{
      data: [ThematicLandingPage]
    }>(`/api/landing-thematiques?${thematicLPSearchParams}`)

    if (thematicLPResponse.data?.length !== 1) {
      // eslint-disable-next-line no-console
      console.error(
        `Error: fetch thematic LP metadata error for slug: ${landingPageSlug}`
      )
      return
    }

    const {
      data: [thematicLPMetadata],
    } = thematicLPResponse

    return {
      thematicLandingPageMetadata: thematicLPMetadata,
    }
  } catch (error) {
    logger.warn(toError(error), {
      scope: 'site.action.fetchThematicLandingPageMetadata',
    })

    return {}
  }
}
