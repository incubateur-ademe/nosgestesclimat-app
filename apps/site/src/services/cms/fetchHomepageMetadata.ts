import type {
  ImageType,
  MetaType,
  PopulatedHomePageType,
} from '@/adapters/cmsClient'
import { cmsClient } from '@/adapters/cmsClient'
import { PAGE_SIZE } from '@/constants/blog/pagination'
import { type Locale } from '@/i18nConfig'
import { captureException } from '@sentry/nextjs'

export async function fetchHomepageMetadata({
  locale,
  pageNumber,
}: {
  locale: Locale
  pageNumber: number
}): Promise<
  | {
      metaTitle: string
      metaDescription?: string | null
      image?: ImageType | null
      pageCount: number
    }
  | undefined
> {
  try {
    const searchParams = new URLSearchParams({
      locale,
      'populate[0]': 'image',
      'populate[1]': 'pageMetadata',
      'pagination[page]': pageNumber.toString(),
    })

    const homepageResponse = await cmsClient<{
      data: PopulatedHomePageType<'image' | 'pageMetadata'>
    }>(`/api/home-page?${searchParams}`)

    if (!homepageResponse?.data) {
      // eslint-disable-next-line no-console
      console.error('Error: homepageResponse?.data is undefined')
      return
    }

    const articlesSearchParams: Record<string, string> = {
      locale,
      'pagination[page]': pageNumber.toString(),
      'pagination[pageSize]': PAGE_SIZE.toString(),
    }

    const articlesResponse = await cmsClient<{
      meta: MetaType
    }>(`/api/articles?${new URLSearchParams(articlesSearchParams)}`)

    const { meta } = articlesResponse

    const { pageMetadata, image } = homepageResponse.data

    return {
      metaTitle: pageMetadata.title,
      metaDescription: pageMetadata.description,
      image: image,
      pageCount: meta?.pagination?.pageCount ?? 0,
    }
  } catch (error) {
    captureException(error)

    return
  }
}
