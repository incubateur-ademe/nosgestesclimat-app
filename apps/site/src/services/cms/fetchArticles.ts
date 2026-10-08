import type { ArticleType } from '@/adapters/cmsClient'
import { cmsClient } from '@/adapters/cmsClient'
import { type Locale } from '@/i18nConfig'
import _logger from '@/logger/logger.server'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import { cacheLife } from 'next/cache'
import { URLSearchParams } from 'url'

interface Props {
  locale: Locale
  params: Record<string, string>
}

export async function fetchArticles(
  props?: Props
): Promise<{ data: ArticleType[]; isError?: boolean }> {
  'use cache'
  cacheLife('hours')

  const { params, locale } = props || {}

  const logger = _logger.child({ scope: 'site.action.fetchArticles', locale })

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
    logger.warn(toError(error))

    return { data: [], isError: true }
  }
}
