'use client'

import Breadcrumbs from '@/design-system/layout/Breadcrumbs'
import { useClientTranslation } from '@/hooks/useClientTranslation'

export default function CategoryBreadcrumbs({
  slug,
  title,
}: {
  slug: string
  title: string
}) {
  const { t } = useClientTranslation()

  return (
    <Breadcrumbs
      className="relative"
      items={[
        { href: '/blog', label: t('Accueil Blog') },
        { href: `/blog/${slug}`, label: title, isActive: true },
      ]}
    />
  )
}
