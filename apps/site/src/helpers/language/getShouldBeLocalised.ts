'use server'

import { fetchArticlePageContent } from '@/services/cms/fetchArticlePageContent'
import { fetchCategoryPageContent } from '@/services/cms/fetchCategoryPageContent'

interface Props {
  category?: string
  article?: string
  landingPageSlug?: string
}

export async function getShouldBeLocalised({
  category,
  article,
  landingPageSlug,
}: Props = {}) {
  // Thematic landing pages aren't translated
  if (landingPageSlug) {
    return false
  }

  // Article page
  if (category && article) {
    const result = await fetchArticlePageContent({
      articleSlug: article,
      categorySlug: category,
      locale: 'en',
    })

    return !!result?.article
  }

  // Category page
  if (category) {
    const result = await fetchCategoryPageContent({
      slug: category,
      locale: 'en',
      page: 1,
    })

    return !!(result?.title && result?.description)
  }

  return true
}
