import type { BlogCategoryType } from '@/adapters/cmsClient'
import { cmsClient } from '@/adapters/cmsClient'
import { type Locale } from '@/i18nConfig'
import logger from '@/logger/logger.server'
import { toError } from '@nosgestesclimat/core/lib/to-error'

export async function fetchCategories({
  locale,
}: {
  locale: Locale
}): Promise<BlogCategoryType[]> {
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
    logger.warn(toError(error), { scope: 'site.action.fetchCategories' })

    return []
  }
}
