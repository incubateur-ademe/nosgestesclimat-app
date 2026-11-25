'use client'

import Question from '@/components/form/Question'
import { captureSubQuestion } from '@/constants/tracking/trackers'
import Button from '@/design-system/buttons/Button'
import type { CustomQuestionRendererProps } from '@/form-controller'
import {
  computeAveragePassengers,
  computeTotal,
  computeTotalForOnePassenger,
} from '@/components/custom-questions/voiture/journeys'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { Journey } from '@/types/journey'
import { trackEvent } from '@/utils/analytics/trackEvent'
import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'
import PencilIcon from '../icons/PencilIcon'
import JourneysInput from './voiture/JourneysInput'

export default function Voiture({
  question,
  draft,
  onChange,
}: CustomQuestionRendererProps<Journey[]>) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useClientTranslation()

  const journeys = draft ?? []
  const total = computeTotal(journeys)
  const averagePassengers = computeAveragePassengers(journeys, total)
  const totalForOnePassenger = computeTotalForOnePassenger(
    journeys,
    total,
    averagePassengers
  )
  const setJourneys: Dispatch<SetStateAction<Journey[]>> = (action) =>
    onChange?.(typeof action === 'function' ? action(journeys) : action)

  return (
    <>
      <Question question={question} className="mb-4" />
      <div className="mb-4 flex flex-col items-start">
        <Button
          variant="link"
          size="xs"
          onClick={() => {
            trackEvent(
              captureSubQuestion({
                question,
                state: isOpen ? 'closed' : 'opened',
              })
            )
            setIsOpen((prevIsOpen) => !prevIsOpen)
          }}
          className="mb-2">
          {isOpen ? (
            t('common.buttons.close', 'Fermer')
          ) : (
            <span className="flex items-center">
              <PencilIcon
                className="stroke-primary-700 mr-2"
                width="16"
                height="16"
              />
              {t(
                'simulator.customQuestions.voiture.open',
                'Détailler mes trajets'
              )}
            </span>
          )}
        </Button>
        {isOpen ? (
          <JourneysInput
            journeys={journeys}
            setJourneys={setJourneys}
            total={total}
            averagePassengers={averagePassengers}
            totalForOnePassenger={totalForOnePassenger}
          />
        ) : null}
      </div>
    </>
  )
}
