'use client'

import ImpactCO2Iframe from '@/components/iframe/ImpactCO2Iframe'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { Locale } from '@/i18nConfig'
import { useRule } from '@/publicodes-state'

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
      type="chauffage"
      options={{ m2: String(value ?? '63') }}
      className="min-h-330"
    />
  )
}
