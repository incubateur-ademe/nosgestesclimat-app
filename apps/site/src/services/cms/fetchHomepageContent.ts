import type {
  ArticleItemType,
  MetaType,
  PopulatedArticleType,
  PopulatedHomePageType,
} from '@/adapters/cmsClient'
import { cmsClient } from '@/adapters/cmsClient'
import { PAGE_SIZE } from '@/constants/blog/pagination'
import { type Locale } from '@/i18nConfig'
import { captureException } from '@sentry/nextjs'

export async function fetchHomepageContent({
  page,
  locale,
}: {
  page: number
  locale: Locale
}): Promise<
  | (Partial<PopulatedHomePageType<'image' | 'pageMetadata'>> & {
      pageCount: number
      mainArticle: PopulatedArticleType<'image' | 'blogCategory'>
      articles: ArticleItemType[]
    })
  | undefined
> {
  try {
    const homepageSearchParams = new URLSearchParams({
      locale,
      'populate[0]': 'image',
      'populate[1]': 'mainArticle',
      'populate[2]': 'mainArticle.image',
      'populate[3]': 'mainArticle.blogCategory',
    })

    const homepageResponse = await cmsClient<{
      data: PopulatedHomePageType<'image' | 'pageMetadata'> & {
        mainArticle: PopulatedArticleType<'image' | 'blogCategory'>
      }
    }>(`/api/home-page?${homepageSearchParams}`)

    if (!homepageResponse?.data) {
      // eslint-disable-next-line no-console
      console.error('Error: homepageResponse?.data is undefined')
      return undefined
    }

    const { mainArticle, image, title, description } = homepageResponse.data

    const articlesSearchParams: Record<string, string> = {
      locale,
      'fields[0]': 'title',
      'fields[1]': 'description',
      'fields[2]': 'slug',
      'populate[0]': 'image',
      'populate[1]': 'blogCategory',
      'pagination[page]': page.toString(),
      'pagination[pageSize]': PAGE_SIZE.toString(),
      sort: 'createdAt:desc',
    }

    if (mainArticle) {
      articlesSearchParams['filters[id][$ne]'] = mainArticle.id
    }

    const articlesResponse = await cmsClient<{
      data: ArticleItemType[]
      meta: MetaType
    }>(`/api/articles?${new URLSearchParams(articlesSearchParams)}`)

    const { data, meta } = articlesResponse

    return {
      title,
      description,
      image,
      mainArticle,
      articles: data ?? [],
      pageCount: meta?.pagination?.pageCount ?? 0,
    }
  } catch (error) {
    captureException(error)

    return undefined
  }
}
