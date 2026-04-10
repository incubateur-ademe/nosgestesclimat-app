import type { ThematicLandingPage } from '@/adapters/cmsClient'
import { cmsClient } from '@/adapters/cmsClient'
import i18nConfig from '@/i18nConfig'

export async function fetchThematicLandingPage({
  landingPageSlug,
}: {
  landingPageSlug: string
}): Promise<
  | {
      thematicLandingPage?: ThematicLandingPage
    }
  | undefined
> {
  try {
    const thematicLPSearchParams = new URLSearchParams({
      locale: i18nConfig.defaultLocale,
      // Block1
      'populate[0]': 'block1',
      'populate[1]': 'block1.image',
      'populate[2]': 'block1.listItems',
      'populate[3]': 'block1.listItems.image',
      // Block2
      'populate[4]': 'block2',
      'populate[5]': 'block2.image',
      'populate[6]': 'block2.listItems',
      'populate[7]': 'block2.listItems.image',
      // Block3
      'populate[8]': 'block3',
      'populate[9]': 'block3.image',
      'populate[10]': 'block3.listItems',
      'populate[11]': 'block3.listItems.image',
      // Block4 (Carousel)
      'populate[12]': 'block4',
      'populate[13]': 'block4.image',
      // Block5
      'populate[14]': 'block5',
      'populate[15]': 'block5.image',
      'populate[16]': 'block5.listItems',
      'populate[17]': 'block5.listItems.image',
      // Block6
      'populate[18]': 'block6',
      'populate[19]': 'block6.image',
      'populate[20]': 'block6.listItems',
      'populate[21]': 'block6.listItems.image',
      // Articles
      'populate[22]': 'articles',
      'populate[23]': 'articles.image',
      'populate[24]': 'articles.blogCategory',
      'populate[25]': 'articles.author',
      'populate[26]': 'articles.author.image',
      // Block7
      'populate[27]': 'block7',
      'populate[28]': 'block7.image',
      'populate[29]': 'block7.listItems',
      'populate[30]': 'block7.listItems.image',
      // FAQ
      'populate[31]': 'faq',
      'populate[32]': 'faq.questions',
      'filters[slug][$eq]': landingPageSlug,
      sort: 'publishedAt:desc',
    })

    const thematicLPResponse = await cmsClient<{
      data: [ThematicLandingPage]
    }>(`/api/landing-thematiques?${thematicLPSearchParams}`)
    if (thematicLPResponse.data?.length !== 1) {
      // eslint-disable-next-line no-console
      console.error(
        `Error: fetch thematic LP error for slug: ${landingPageSlug}`
      )
      return
    }

    const {
      data: [thematicLP],
    } = thematicLPResponse

    return {
      thematicLandingPage: thematicLP,
    }
  } catch {
    return {}
  }
}
