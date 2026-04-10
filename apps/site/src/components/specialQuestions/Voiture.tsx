'use client'

import Question from '@/components/form/Question'
import { captureSubQuestion } from '@/constants/tracking/posthogTrackers'
import { openSubQuestion } from '@/constants/tracking/question'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useState } from 'react'
import PencilIcon from '../icons/PencilIcon'
import JourneysInput from './voiture/JourneysInput'

interface Props {
  question: DottedName
}
export default function Voiture({ question, ...props }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const { t } = useClientTranslation()
  return (
    <>
      <Question question={question} className="mb-4" {...props} />
      <div className="mb-4 flex flex-col items-start">
        <Button
          color="link"
          size="xs"
          onClick={() => {
            trackMatomoEvent__deprecated(openSubQuestion({ question }))
            trackPosthogEvent(
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
        {isOpen ? <JourneysInput question={question} {...props} /> : null}
      </div>
    </>
  )
}
