import type { ArticleItemType } from '@/adapters/cmsClient'
import { cmsClient } from '@/adapters/cmsClient'
import i18nConfig, { type Locale } from '@/i18nConfig'
import { captureException } from '@sentry/nextjs'

const PAGE_SIZE = 100 // Utilisation d'une taille de page plus grande pour réduire le nombre d'appels

export async function fetchAllArticleTitlesAndSlugs({
  locale,
}: {
  locale: Locale
}): Promise<ArticleItemType[]> {
  try {
    let allArticles: ArticleItemType[] = []
    let currentPage = 1
    let hasMorePages = true

    while (hasMorePages) {
      const articlesSearchParams = new URLSearchParams({
        locale: locale ?? i18nConfig.defaultLocale,
        'fields[0]': 'title',
        'fields[1]': 'slug',
        'populate[0]': 'blogCategory',
        'pagination[page]': currentPage.toString(),
        'pagination[pageSize]': PAGE_SIZE.toString(),
        sort: 'createdAt:desc',
      })

      const articlesResponse = await cmsClient<{
        data: ArticleItemType[]
        meta: { pagination: { pageCount: number } }
      }>(`/api/articles?${articlesSearchParams}`)

      const { data: articles, meta } = articlesResponse

      if (articles?.length) {
        allArticles = [...allArticles, ...articles]
      }

      hasMorePages = currentPage < meta.pagination.pageCount
      currentPage++
    }

    return allArticles
  } catch (error) {
    captureException(error)
    return []
  }
}
