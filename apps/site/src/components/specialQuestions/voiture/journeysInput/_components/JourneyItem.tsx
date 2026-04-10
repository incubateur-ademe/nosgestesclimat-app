'use client'

import Button from '@/design-system/buttons/Button'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { Journey } from '@/types/journey'
import type { Dispatch, SetStateAction } from 'react'

interface Props {
  journey: Journey
  odd: boolean
  setJourneys: Dispatch<SetStateAction<Journey[]>>
}

export const periods: Record<string, string> = {
  day: 'jour',
  week: 'semaine',
  month: 'mois',
  year: 'an',
}

export const labels: Record<string, string> = {
  work: t('Domicile-Travail'),
  holidays: t('Vacances'),
  family: t('Visite familiale'),
  school: t('Mobilité académique'),
  sport: t('Sport ou Loisir'),
  occasional: t('Sorties ponctuelles'),
  shopping: t('Courses'),
  medical: t('RDV médicaux'),
  weekends: t('Week-end'),
}

export default function JourneyItem({ journey, odd, setJourneys }: Props) {
  const { t } = useClientTranslation()

  return (
    <tr
      className={`relative block sm:table-row ${odd ? 'bg-primary-100' : ''}`}>
      <td
        className={`block sm:table-cell lg:border-r ${
          odd ? 'border-white' : 'border-primary-200'
        } px-2 text-left text-xs`}>
        {t(labels[journey.label])}
      </td>

      <td
        className={`block sm:table-cell lg:border-x ${
          odd ? 'border-white' : 'border-primary-200'
        } p-2 text-left text-xs`}>
        {journey.distance || 0} km
      </td>

      <td
        className={`block sm:table-cell lg:border-x ${
          odd ? 'border-white' : 'border-primary-200'
        } p-2 text-left text-xs`}>
        {journey.reccurrence}
      </td>

      <td
        className={`block sm:table-cell lg:border-x ${
          odd ? 'border-white' : 'border-primary-200'
        } p-2 text-left text-xs`}>
        {t(periods[journey.period])}
      </td>

      <td className="inline-block p-2 text-left text-xs sm:table-cell">
        {journey.passengers}{' '}
        {t('simulator.customQuestions.voiture.passengers', 'passager(s)')}
      </td>

      <td className="absolute -top-2 -right-1 block py-2 pl-2 text-right text-xs sm:static sm:table-cell">
        <Button
          color="text"
          size="sm"
          title={t(
            'simulator.customQuestions.voiture.deleteItem',
            'Supprimer ce trajet'
          )}
          onClick={() =>
            setJourneys((prevJourneys) =>
              prevJourneys.filter(
                (prevJourney) => prevJourney.id !== journey.id
              )
            )
          }>
          x
        </Button>
      </td>
    </tr>
  )
}
