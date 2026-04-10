import type {
  ArticleItemType,
  PopulatedArticleType,
  PopulatedBlogCategoryType,
} from '@/adapters/cmsClient'
import { cmsClient } from '@/adapters/cmsClient'
import { type Locale } from '@/i18nConfig'

const PAGE_SIZE = 12

export async function fetchCategoryPageContent({
  slug,
  page,
  locale,
}: {
  slug: string
  page: number
  locale: Locale
}): Promise<
  | (Partial<
      PopulatedBlogCategoryType<'faq' | 'image'> & {
        mainArticle: PopulatedArticleType<'image'>
        articles: ArticleItemType[]
      }
    > & {
      pageCount: number
    })
  | undefined
> {
  try {
    const categorySearchParams = new URLSearchParams({
      locale,
      'filters[slug][$eq]': slug,
      'populate[0]': 'image',
      'populate[1]': 'faq',
      'populate[2]': 'faq.questions',
      'populate[3]': 'mainArticle',
      'populate[4]': 'mainArticle.image',
      sort: 'faq.questions.order:asc',
    })

    const categoryResponse = await cmsClient<{
      data: [
        PopulatedBlogCategoryType<'faq' | 'image'> & {
          mainArticle: PopulatedArticleType<'image'>
        },
      ]
    }>(`/api/blog-categories?${categorySearchParams}`)

    if (categoryResponse?.data?.length !== 1) {
      // eslint-disable-next-line no-console
      console.error(`Error: fetch blogCategory error for categorySlug: ${slug}`)
    }

    const {
      data: [blogCategory],
    } = categoryResponse

    const { id: categoryId, mainArticle } = blogCategory

    const { documentId } = mainArticle || {}

    const articlesSearchParams = new URLSearchParams({
      locale,
      'fields[0]': 'title',
      'fields[1]': 'description',
      'fields[2]': 'slug',
      'populate[0]': 'image',
      'populate[1]': 'blogCategory',
      ...(documentId ? { 'filters[documentId][$ne]': documentId } : {}),
      ...(categoryId ? { 'filters[blogCategory][$eq]': categoryId } : {}),
      'pagination[page]': page.toString(),
      'pagination[pageSize]': PAGE_SIZE.toString(),
      sort: 'createdAt:desc',
    })

    const articlesResponse = await cmsClient<{
      data: ArticleItemType[]
      meta: { pagination: { pageCount: number } }
    }>(`/api/articles?${articlesSearchParams}`)

    const { data: articles, meta } = articlesResponse

    return {
      title: blogCategory.title,
      description: blogCategory.description,
      mainArticle: blogCategory.mainArticle,
      additionalContent: blogCategory.htmlContent,
      image: blogCategory.image,
      articles,
      pageCount: meta.pagination.pageCount,
      faq: blogCategory.faq,
      faqDescription: blogCategory.faqDescription,
    }
  } catch {
    return undefined
  }
}
