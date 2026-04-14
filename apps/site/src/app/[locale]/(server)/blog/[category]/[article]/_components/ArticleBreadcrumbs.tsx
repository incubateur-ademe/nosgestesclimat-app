'use client'

import Breadcrumbs from '@/design-system/layout/Breadcrumbs'
import { useClientTranslation } from '@/hooks/useClientTranslation'

export default function ArticleBreadcrumbs({
  categorySlug,
  categoryTitle,
  articleTitle,
  articleSlug,
}: {
  categorySlug: string
  categoryTitle: string
  articleTitle: string
  articleSlug: string
}) {
  const { t } = useClientTranslation()

  return (
    <Breadcrumbs
      className="relative"
      linkClassName="normal-case"
      items={[
        { href: '/blog', label: t('Accueil Blog') },
        { href: `/blog/${categorySlug}`, label: categoryTitle },
        {
          href: `/blog/${categorySlug}/${articleSlug}`,
          label: articleTitle,
          isActive: true,
        },
      ]}
    />
  )
}
