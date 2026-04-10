'use client'

import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useLocale } from '@/hooks/useLocale'

interface Props {
  total: number
  averagePassengers: number
  totalForOnePassenger: number
}

export default function Summary({
  total,
  averagePassengers,
  totalForOnePassenger,
}: Props) {
  const locale = useLocale()
  const { t } = useClientTranslation()

  return (
    <div className="mt-4 px-2 text-right text-xs">
      {t('simulator.customQuestions.voiture.summaryStart', 'Au total')}{' '}
      {total.toLocaleString(locale)}{' '}
      {t(
        'simulator.customQuestions.voiture.summaryKmPerYear',
        'km sont parcourus par an, avec en moyenne'
      )}{' '}
      {averagePassengers.toLocaleString(locale)}{' '}
      {t(
        'simulator.customQuestions.voiture.summaryPassengers',
        'voyageurs, soit'
      )}{' '}
      {(totalForOnePassenger ?? 0).toLocaleString(locale)}{' '}
      {t(
        'simulator.customQuestions.voiture.summaryKmPerPerson',
        'km par personne'
      )}
      . <br className="hidden md:inline" />
      {t(
        'simulator.customQuestions.voiture.summaryEnd',
        'C’est bien cette distance qui sera comptabilisée en fin de test.'
      )}
    </div>
  )
}
