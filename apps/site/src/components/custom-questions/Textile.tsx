'use client'

import Question from '@/components/form/Question'
import { captureSubQuestion } from '@/constants/tracking/trackers'
import Button from '@/design-system/buttons/Button'
import { useFormQuestion } from '@/form-controller'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { trackEvent } from '@/utils/analytics/trackEvent'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { cn } from 'cn'
import PencilIcon from '../icons/PencilIcon'

const PRECISE_CHOICE: DottedName = 'divers . textile . choix précis'
const PRECISE_FOOTPRINT: DottedName = 'divers . textile . empreinte précise'

export default function Textile({ question }: { question: DottedName }) {
  const { t } = useClientTranslation()
  // The toggle is a question like any other: its answer goes through a draft.
  const preciseChoiceQuestion = useFormQuestion(PRECISE_CHOICE)

  const isPrecise =
    preciseChoiceQuestion.type === 'boolean' && preciseChoiceQuestion.value

  const togglePreciseChoice = () => {
    if (preciseChoiceQuestion.type !== 'boolean') return
    trackEvent(
      captureSubQuestion({
        question,
        state: isPrecise ? 'closed' : 'opened',
      })
    )
    preciseChoiceQuestion.setValue(!isPrecise)
  }

  return (
    <>
      <Question
        question={question}
        className={cn('mb-4', isPrecise && 'pointer-events-none opacity-20')}
      />
      <div className="flex flex-col items-start text-sm md:flex-row md:items-center">
        <span>{t('Pour plus de précision:')}</span>
        <div>
          <Button
            variant="link"
            size="xs"
            onClick={togglePreciseChoice}
            className="mt-1 md:mt-0 md:ml-2">
            {isPrecise ? (
              t('Fermer')
            ) : (
              <span className="flex items-center">
                <PencilIcon
                  className="stroke-primary-700 mr-2"
                  width="16"
                  height="16"
                />
                {t(
                  'simulator.customQuestions.textile.open',
                  'Je détaille ma garde-robe'
                )}
              </span>
            )}
          </Button>
        </div>
      </div>
      {isPrecise ? (
        <div className="p-4">
          <Question question={PRECISE_FOOTPRINT} headingLevel={3} />
        </div>
      ) : null}
    </>
  )
}
