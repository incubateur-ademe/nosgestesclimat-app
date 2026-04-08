'use client'

import Trans from '@/components/translation/trans/TransClient'
import { captureClickFormNav } from '@/constants/tracking/posthogTrackers'
import { questionClickPass } from '@/constants/tracking/question'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import {
  useCurrentSimulation,
  useEngine,
  useFormState,
  useRule,
} from '@/publicodes-state'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useCallback } from 'react'

interface Props {
  question: DottedName
}

export default function DontKnowButton({ question }: Props) {
  const { gotoNextQuestion } = useFormState()

  const { t } = useClientTranslation()

  const { updateCurrentSimulation } = useCurrentSimulation()

  const { value, questionsOfMosaicFromParent, isMissing } = useRule(question)

  const { getValue } = useEngine()

  const handleFoldWithDefaultValue = useCallback(() => {
    if (questionsOfMosaicFromParent.length > 0) {
      questionsOfMosaicFromParent.forEach((mosaicChild) => {
        updateCurrentSimulation({
          foldedStepToAdd: {
            foldedStep: mosaicChild,
            value: getValue(mosaicChild),
            isMosaicChild: true,
          },
        })
      })
    }

    updateCurrentSimulation({
      foldedStepToAdd: {
        foldedStep: question,
        // Use getValue to read the current engine state (after potential reset)
        // rather than the stale `value` from the render closure
        value: getValue(question),
        isMosaicParent: questionsOfMosaicFromParent.length > 0,
      },
    })
  }, [question, questionsOfMosaicFromParent, updateCurrentSimulation, getValue])

  const handleClick = () => {
    trackMatomoEvent__deprecated(
      // Dummy time for AB test
      questionClickPass({ question, timeSpentOnQuestion: 0 })
    )
    trackPosthogEvent(
      captureClickFormNav({
        actionType: 'passer',
        question,
        answer: value,
        // Dummy time for AB test
        timeSpentOnQuestion: 0,
      })
    )

    // Fold the step with the default value (skip behavior)
    handleFoldWithDefaultValue()

    gotoNextQuestion()
  }

  return (
    <div className="mt-4 flex flex-col items-start gap-4 md:flex-row">
      <Button
        onClick={handleClick}
        className="text-sm!"
        color="borderless"
        disabled={!isMissing}
        aria-label={t(
          'common.navigation.nextQuestion.dontKnow.title',
          'Je ne sais pas répondre, passer et aller à la question suivante'
        )}>
        <Trans i18nKey="simulator.dontKnow.button.label">
          Je ne sais pas répondre
        </Trans>
      </Button>

      <p className="text-primary-600 w-80 max-w-full text-sm">
        <Trans i18nKey="simulator.dontKnow.button.reassurance">
          Pas d'inquiétude, on prend des données moyennes pour garder vos
          résultats fiables.
        </Trans>
      </p>
    </div>
  )
}
