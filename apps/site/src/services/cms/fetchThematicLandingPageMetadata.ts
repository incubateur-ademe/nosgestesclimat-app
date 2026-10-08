import { cmsClient, type ThematicLandingPage } from '@/adapters/cmsClient'
import i18nConfig from '@/i18nConfig'
import _logger from '@/logger/logger.server'
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
  const logger = _logger.child({
    scope: 'site.action.fetchThematicLandingPageMetadata',
    landingPageSlug,
    locale: i18nConfig.defaultLocale,
  })

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
      logger.info('The CMS returned no thematic landing page')
      return
    }

    const {
      data: [thematicLPMetadata],
    } = thematicLPResponse

    return {
      thematicLandingPageMetadata: thematicLPMetadata,
    }
  } catch (error) {
    logger.warn(toError(error))

    return {}
  }
}
