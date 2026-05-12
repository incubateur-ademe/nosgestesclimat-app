'use client'

import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { Locale } from '@/i18nConfig'
import { useRule } from '@/publicodes-state'
import ImpactCO2Iframe from '../../_components/transitionInfoCard/ImpactCO2Iframe'

interface Props {
  locale: Locale
}

export default function ClientLogementImpactCO2Iframe({ locale }: Props) {
  const { value } = useRule('logement . surface')

  const { t } = useClientTranslation()

  return (
    <ImpactCO2Iframe
      title={t(
        'simulator.intercalaire.logement.iframe.title',
        "Comparateur d'impact CO₂ du chauffage"
      )}
      locale={locale}
      additionalSearchParams={`m2=${value ?? '63'}`}
    />
  )
}
