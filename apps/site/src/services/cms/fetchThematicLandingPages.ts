'use server'

import { cmsClient } from '@/adapters/cmsClient'
import i18nConfig from '@/i18nConfig'

interface ThematicLandingPageSummary {
  id: string
  title: string
  slug: string
}

export async function fetchThematicLandingPages(): Promise<
  | {
      thematicLandingPages: ThematicLandingPageSummary[]
    }
  | undefined
> {
  try {
    const thematicLPSearchParams = new URLSearchParams({
      locale: i18nConfig.defaultLocale,
      'fields[0]': 'id',
      'fields[1]': 'title',
      'fields[2]': 'slug',
      sort: 'publishedAt:desc',
    })

    const thematicLPResponse = await cmsClient<{
      data: ThematicLandingPageSummary[]
    }>(`/api/landing-thematiques?${thematicLPSearchParams}`)

    if (!thematicLPResponse?.data) {
      // eslint-disable-next-line no-console
      console.error('Error: fetchThematicLandingPages - no data returned')
      return
    }

    return {
      thematicLandingPages: thematicLPResponse.data,
    }
  } catch {
    return {
      thematicLandingPages: [],
    }
  }
}
