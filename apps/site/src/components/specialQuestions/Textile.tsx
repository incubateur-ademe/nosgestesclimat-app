'use client'

import Question from '@/components/form/Question'
import { captureSubQuestion } from '@/constants/tracking/posthogTrackers'
import { openSubQuestion } from '@/constants/tracking/question'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useCurrentSimulation, useRule } from '@/publicodes-state'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { utils } from 'publicodes'
import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'
import PencilIcon from '../icons/PencilIcon'

interface Props {
  question: DottedName
}

const POSSIBLE_ANSWERS: Record<string, DottedName> = {
  minimum: 'divers . textile . volume . minimum',
  'renouvellement occasionnel':
    'divers . textile . volume . renouvellement occasionnel',
  'accro au shopping': 'divers . textile . volume . accro au shopping',
}

export default function Textile({ question, ...props }: Props) {
  const { t } = useClientTranslation()
  const { numericValue: totalPiecesTextile } = useRule(
    'divers . textile . nombre total'
  )
  const { value: preciseChoice, setValue: setPreciseChoice } = useRule(
    'divers . textile . choix précis'
  )
  const { isFolded, setValue } = useRule(question)

  const { isMissing: isMissingMosaic } = useRule(
    'divers . textile . empreinte précise'
  )

  const { updateCurrentSimulation } = useCurrentSimulation()

  useEffect(() => {
    // if mosaic answer is missing, we don't update question
    if (!preciseChoice || isMissingMosaic) return

    // 0 is considered as minimal (model logic)
    if (totalPiecesTextile <= 15) {
      setValue(utils.nameLeaf(POSSIBLE_ANSWERS.minimum))
    }
    if (totalPiecesTextile > 15 && totalPiecesTextile <= 35) {
      setValue(utils.nameLeaf(POSSIBLE_ANSWERS['renouvellement occasionnel']))
    }
    if (totalPiecesTextile > 35) {
      setValue(utils.nameLeaf(POSSIBLE_ANSWERS['accro au shopping']))
    }

    // Must be after situation update, "parent" question must be folded is precise choice.
    if (!isFolded) {
      updateCurrentSimulation({
        foldedStepToAdd: {
          foldedStep: question,
          isMosaicParent: true,
        },
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preciseChoice, totalPiecesTextile, isFolded, isMissingMosaic])

  return (
    <>
      <Question
        question={question}
        className={twMerge(
          'mb-4',
          preciseChoice && 'pointer-events-none opacity-20'
        )}
        {...props}
      />
      <div className="flex flex-col items-start text-sm md:flex-row md:items-center">
        <span>{t('Pour plus de précision:')}</span>
        <div>
          <Button
            color="link"
            size="xs"
            onClick={() => {
              trackMatomoEvent__deprecated(openSubQuestion({ question }))
              trackPosthogEvent(
                captureSubQuestion({
                  question,
                  state: preciseChoice ? 'closed' : 'opened',
                })
              )
              setPreciseChoice(preciseChoice ? 'non' : 'oui')
            }}
            className="mt-1 md:mt-0 md:ml-2">
            {preciseChoice ? (
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
      {preciseChoice ? (
        <div className="p-4">
          <Question
            question={'divers . textile . empreinte précise'}
            headingLevel={3}
            {...props}
          />
        </div>
      ) : null}
    </>
  )
}
