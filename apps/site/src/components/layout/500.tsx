'use client'

import Trans from '@/components/translation/trans/TransClient'
import InlineLink from '@/design-system/inputs/InlineLink'
import { useClientTranslation } from '@/hooks/useClientTranslation'

export default function Error500() {
  const { t } = useClientTranslation()

  return (
    <div
      data-testid="500-error"
      className="text-primary-700 mx-auto my-16 text-center">
      <h1 className="flex items-center justify-center">
        {t('Oups\u202f! Une erreur est survenue')} 
        <span role="img" aria-hidden>
          😮
        </span>
      </h1>

      <InlineLink href="/" className="flex flex-col items-center text-center!">
        <em>
          <Trans i18nKey="404.action">Revenir en lieu sûr</Trans>
        </em>
      </InlineLink>
    </div>
  )
}
