'use client'

import CloseIcon from '@/components/icons/Close'
import {
  labels,
  periods,
} from '@/components/specialQuestions/voiture/journeysInput/_components/JourneyItem'
import Button from '@/design-system/buttons/Button'
import SelectInput from '@/design-system/inputs/SelectInput'
import TextInput from '@/design-system/inputs/TextInput'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { Journey } from '@/types/journey'
import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { v4 as uuid } from 'uuid'

interface Props {
  setJourneys: Dispatch<SetStateAction<Journey[]>>
  className?: string
}

export default function AddJourneyMobile({ setJourneys, className }: Props) {
  const { t } = useClientTranslation()
  const [label, setLabel] = useState('holidays')
  const [distance, setDistance] = useState('10')
  const [reccurrence, setReccurrence] = useState(1)
  const [period, setPeriod] = useState('week')
  const [passengers, setPassengers] = useState(1)

  return (
    <tr className={twMerge('border-primary-700 block border-b p-2', className)}>
      <td className="mb-4 block text-sm">
        <SelectInput
          className="w-full text-sm"
          containerClassName="w-full"
          value={label}
          name="label"
          label={t('Label')}
          onChange={(e) => setLabel(e.target.value)}>
          {Object.entries(labels).map(([key, label], i) => {
            return (
              <option key={i} value={key}>
                {t(label)}
              </option>
            )
          })}
        </SelectInput>
      </td>
      <td className="border-primary-700 block pb-4 text-sm">
        <span className="flex items-end gap-2">
          <TextInput
            className="text-sm"
            containerClassName="w-32"
            name="distance"
            type="number"
            label={t('Distance')}
            value={distance}
            onChange={(e) => setDistance((e.target as HTMLInputElement).value)}
          />{' '}
          <span className="mb-4 inline-block">km</span>
        </span>
      </td>
      <td className="border-primary-700 block pb-4 text-sm">
        <div className="flex items-end gap-4">
          <TextInput
            className="w-20 text-sm"
            containerClassName="w-20"
            name="frequence"
            type="number"
            label={t('Fréquence')}
            value={reccurrence}
            onChange={(e) =>
              setReccurrence(Number((e.target as HTMLInputElement).value))
            }
          />
          <div className="mb-4 inline-block">
            <CloseIcon className="w-4" />
          </div>
          <SelectInput
            className="text-sm"
            value={period}
            name="period"
            label={t('Période')}
            onChange={(e) => setPeriod(e.target.value)}>
            {Object.entries(periods).map(([key, period], i) => {
              return (
                <option key={i} value={key}>
                  {t(period)}
                </option>
              )
            })}
          </SelectInput>
        </div>
      </td>
      <td className="border-primary-700 block pb-4 text-sm">
        <SelectInput
          className="w-20 text-sm"
          name="passengers"
          value={passengers}
          label={t('Passagers')}
          onChange={(e) => setPassengers(Number(e.target.value))}>
          {new Array(5).fill(0).map((_, i) => {
            return (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            )
          })}
        </SelectInput>
      </td>
      <td className="border-primary-700 block pl-2 text-right text-sm">
        <Button
          size="sm"
          title={t('simulator.car.addTravel', 'Ajouter un trajet')}
          onClick={() =>
            setJourneys((prevJourneys) => [
              ...prevJourneys,
              {
                id: uuid(),
                label,
                distance: Number(distance),
                reccurrence,
                period,
                passengers,
              },
            ])
          }>
          {t('Ajouter')}
        </Button>
      </td>
    </tr>
  )
}
