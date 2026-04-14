import type {
  PopulatedArticleType,
  PopulatedAuthorType,
} from '@/adapters/cmsClient'
import { cmsClient } from '@/adapters/cmsClient'
import { type Locale } from '@/i18nConfig'

type Article = PopulatedArticleType<'image' | 'blogCategory'> & {
  author: PopulatedAuthorType<'image'>
}

export async function fetchArticlePageContent({
  articleSlug,
  categorySlug,
  locale,
}: {
  articleSlug: string
  categorySlug: string
  locale: Locale
}): Promise<
  | {
      article?: Article
      otherArticles?: PopulatedArticleType<'image' | 'blogCategory'>[]
    }
  | undefined
> {
  try {
    const articleSearchParams = new URLSearchParams({
      locale,
      'populate[0]': 'image',
      'populate[1]': 'blogCategory',
      'populate[2]': 'author',
      'populate[3]': 'author.image',
      'filters[slug][$eq]': articleSlug,
      'filters[blogCategory][slug][$eq]': categorySlug,
      sort: 'publishedAt:desc',
    })

    const articleResponse = await cmsClient<{
      data: [Article]
    }>(`/api/articles?${articleSearchParams}`)

    if (articleResponse.data?.length !== 1) {
      // eslint-disable-next-line no-console
      console.error(
        `Error: fetch article error for articleSlug: ${articleSlug}`
      )
      return
    }

    const {
      data: [article],
    } = articleResponse

    const otherArticlesSearchParams = new URLSearchParams({
      locale,
      'populate[0]': 'image',
      'populate[1]': 'blogCategory',
      ...(categorySlug
        ? { 'filters[blogCategory][slug][$eq]': categorySlug }
        : {}),
      'filters[slug][$ne]': articleSlug,
      sort: 'createdAt:desc',
      'pagination[start]': '0',
      'pagination[limit]': '3',
    })

    const otherArticlesResponse = await cmsClient<{
      data: PopulatedArticleType<'image' | 'blogCategory'>[]
    }>(`/api/articles?${otherArticlesSearchParams}`)

    return {
      article,
      otherArticles: otherArticlesResponse?.data ?? [],
    }
  } catch {
    return
  }
}
