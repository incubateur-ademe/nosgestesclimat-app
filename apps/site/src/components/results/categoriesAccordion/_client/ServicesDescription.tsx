'use client'

import { useClientTranslation } from '@/hooks/useClientTranslation'
import { Trans } from 'react-i18next'

export default function ServicesDescription() {
  const { t } = useClientTranslation()

  return (
    <p>
      <Trans t={t} i18nKey="results.categories.services.text">
        Les services (santé, éducation, télécoms…) représentent environ{' '}
        <strong>1,5 t de votre empreinte</strong>. Cette part est{' '}
        <strong>la même pour tous</strong> et{' '}
        <strong>diminue progressivement</strong> avec la transition écologique.
      </Trans>
    </p>
  )
}
