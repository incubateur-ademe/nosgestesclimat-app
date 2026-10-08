'use server'

import { cmsClient } from '@/adapters/cmsClient'
import i18nConfig from '@/i18nConfig'
import _logger from '@/logger/logger.server'
import { toError } from '@nosgestesclimat/core/lib/to-error'

interface ThematicLandingPageSummary {
  id: string
  title: string
  slug: string
  updatedAt: string
}

export async function fetchThematicLandingPages(): Promise<
  | {
      thematicLandingPages: ThematicLandingPageSummary[]
    }
  | undefined
> {
  const logger = _logger.child({
    scope: 'site.action.fetchThematicLandingPages',
    locale: i18nConfig.defaultLocale,
  })

  try {
    const thematicLPSearchParams = new URLSearchParams({
      locale: i18nConfig.defaultLocale,
      'fields[0]': 'id',
      'fields[1]': 'title',
      'fields[2]': 'slug',
      'fields[3]': 'updatedAt',
      sort: 'publishedAt:desc',
    })

    const thematicLPResponse = await cmsClient<{
      data: ThematicLandingPageSummary[]
    }>(`/api/landing-thematiques?${thematicLPSearchParams}`)

    if (!thematicLPResponse?.data) {
      logger.warn('The CMS returned no thematic landing pages')
      return
    }

    return {
      thematicLandingPages: thematicLPResponse.data,
    }
  } catch (error) {
    logger.warn(toError(error))

    return {
      thematicLandingPages: [],
    }
  }
}
