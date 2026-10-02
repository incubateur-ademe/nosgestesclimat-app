import type {
  ArticleItemType,
  ImageType,
  PopulatedArticleType,
  PopulatedBlogCategoryType,
} from '@/adapters/cmsClient'
import { cmsClient } from '@/adapters/cmsClient'
import { PAGE_SIZE } from '@/constants/blog/pagination'
import { type Locale } from '@/i18nConfig'
import logger from '@/logger/logger.server'
import { toError } from '@nosgestesclimat/core/lib/to-error'

export async function fetchCategoryPageMetadata({
  slug,
  locale,
  pageNumber,
}: {
  slug: string
  locale: Locale
  pageNumber: number
}): Promise<
  | {
      metaTitle: string
      metaDescription: string
      image: ImageType | null
      pageCount: number
    }
  | undefined
> {
  try {
    const categorySearchParams = new URLSearchParams({
      locale,
      'populate[0]': 'image',
      'populate[1]': 'pageMetadata',
      'filters[slug][$eq]': slug,
      'populate[3]': 'mainArticle',
    })

    const categoryResponse = await cmsClient<{
      data: [
        PopulatedBlogCategoryType<'image' | 'pageMetadata'> & {
          mainArticle: PopulatedArticleType<'pageMetadata'>
        },
      ]
    }>(`/api/blog-categories?${categorySearchParams}`)

    if (categoryResponse?.data.length !== 1) {
      // eslint-disable-next-line no-console
      console.error(`Error: fetch blogCategory error for categorySlug: ${slug}`)
      return
    }

    const {
      data: [blogCategory],
    } = categoryResponse

    const { id: categoryId, mainArticle } = blogCategory

    const { documentId } = mainArticle || {}

    const articlesSearchParams = new URLSearchParams({
      locale,
      ...(documentId ? { 'filters[documentId][$ne]': documentId } : {}),
      ...(categoryId ? { 'filters[blogCategory][$eq]': categoryId } : {}),
      'pagination[page]': pageNumber.toString(),
      'pagination[pageSize]': PAGE_SIZE.toString(),
      sort: 'createdAt:desc',
    })

    const articlesResponse = await cmsClient<{
      data: ArticleItemType[]
      meta: { pagination: { pageCount: number } }
    }>(`/api/articles?${articlesSearchParams}`)

    const { meta } = articlesResponse

    return {
      metaTitle: blogCategory.pageMetadata.title,
      metaDescription: blogCategory.pageMetadata.description ?? '',
      image: blogCategory.image,
      pageCount: meta.pagination.pageCount,
    }
  } catch (error) {
    logger.warn(toError(error), {
      scope: 'site.action.fetchCategoryPageMetadata',
    })

    return
  }
}
