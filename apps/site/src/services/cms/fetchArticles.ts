import type { ArticleType } from '@/adapters/cmsClient'
import { cmsClient } from '@/adapters/cmsClient'
import { type Locale } from '@/i18nConfig'
import { captureException } from '@sentry/nextjs'
import { URLSearchParams } from 'url'

interface Props {
  locale: Locale
  params: Record<string, string>
}

export async function fetchArticles(
  props?: Props
): Promise<{ data: ArticleType[]; isError?: boolean }> {
  const { params, locale } = props || {}

  try {
    const articlesSearchParams = new URLSearchParams({
      locale: locale as string,
      ...params,
    })

    const articlesResponse = await cmsClient<{ data: ArticleType[] }>(
      `/api/articles?${articlesSearchParams}`
    )

    return { data: articlesResponse.data }
  } catch (error) {
    captureException(error)

    return { data: [], isError: true }
  }
}
