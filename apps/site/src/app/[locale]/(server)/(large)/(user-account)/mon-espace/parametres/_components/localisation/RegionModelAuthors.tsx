'use client'

import Link from '@/components/Link'
import { useClientTranslation } from '@/hooks/useClientTranslation'

interface RegionAuthor {
  nom: string
  url?: string
}

export default function RegionModelAuthors({
  authors = [],
}: {
  authors?: RegionAuthor[]
}) {
  const { t } = useClientTranslation()

  const DEFAULT_REGION_MODEL_AUTHOR: RegionAuthor = {
    nom: t('l’équipe de nosgestesclimat.fr'),
    url: '/a-propos',
  }

  return (
    <small>
      <p className="m-0">
        {t('Ce modèle a été conçu par')}{' '}
        {authors.length > 0 &&
          authors.map((author, i) => {
            return (
              <span key={author.nom}>
                <Link href={author?.url ?? '#'} target="_blank">
                  {author.nom}
                </Link>
                {i !== authors.length - 1 && ' ' + t('et') + ' '}
              </span>
            )
          })}
        {authors.length === 0 && (
          <Link href={DEFAULT_REGION_MODEL_AUTHOR.url || ''}>
            {DEFAULT_REGION_MODEL_AUTHOR.nom}
          </Link>
        )}
      </p>
    </small>
  )
}
