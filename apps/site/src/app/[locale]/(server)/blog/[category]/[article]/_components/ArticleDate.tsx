import type { ArticleType } from '@/adapters/cmsClient'
import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'

interface Props {
  article: ArticleType
  locale: Locale
}

export default function ArticleDate({ article, locale }: Props) {
  const createdAt = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString('fr')
    : null
  const updatedAt = article.updatedAt
    ? new Date(article.updatedAt).toLocaleDateString('fr')
    : null

  return (
    <>
      <p className="mb-0">
        <span className="text-primary-600">
          <Trans locale={locale}>Publié le :</Trans>
        </span>{' '}
        {createdAt}
      </p>
      {updatedAt && updatedAt !== createdAt && (
        <p className="mb-0">
          <span className="text-primary-600">
            <Trans locale={locale}>Dernière mise à jour :</Trans>
          </span>{' '}
          {updatedAt}
        </p>
      )}
    </>
  )
}
