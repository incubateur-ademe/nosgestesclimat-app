import type { BlogCategoryType } from '@/adapters/cmsClient'
import { cmsClient } from '@/adapters/cmsClient'
import { type Locale } from '@/i18nConfig'
import _logger from '@/logger/logger.server'
import { toError } from '@nosgestesclimat/core/lib/to-error'

export async function fetchCategories({
  locale,
}: {
  locale: Locale
}): Promise<BlogCategoryType[]> {
  const logger = _logger.child({ scope: 'site.action.fetchCategories', locale })

  try {
    const categoriesSearchParams = new URLSearchParams({
      locale,
      sort: 'order',
    })

    const categoriesResponse = await cmsClient<{ data: BlogCategoryType[] }>(
      `/api/blog-categories?${categoriesSearchParams}`
    )

    return categoriesResponse.data
  } catch (error) {
    logger.warn(toError(error))

    return []
  }
}
