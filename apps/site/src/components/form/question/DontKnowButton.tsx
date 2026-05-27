'use client'

import Trans from '@/components/translation/trans/TransClient'
import { captureClickFormNav } from '@/constants/tracking/posthogTrackers'
import { questionClickPass } from '@/constants/tracking/question'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useCurrentSimulation, useEngine, useRule } from '@/publicodes-state'
import { useGotoNextQuestion } from '@/publicodes-state/hooks/useGotoNextQuestion/useGotoNextQuestion'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useCallback, useEffect, useRef } from 'react'
import { useClearFromSituation } from '../hooks/useClearFromSituation'
import { useQuestionTimeSpent } from '../hooks/useQuestionTimeSpent'

interface Props {
  question: DottedName
}

export default function DontKnowButton({ question }: Props) {
  const { t } = useClientTranslation()
  const { goToNextQuestion } = useGotoNextQuestion()
  const { updateCurrentSimulation } = useCurrentSimulation()

  const { questionsOfMosaicFromParent, isMissing } = useRule(question)

  const { getValue } = useEngine()

  const { getQuestionTimeSpent } = useQuestionTimeSpent(question)

  const { clearFromSituation } = useClearFromSituation()

  const pendingNavigationRef = useRef(false)

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
    const timeSpent = getQuestionTimeSpent()
    trackMatomoEvent__deprecated(
      questionClickPass({
        question,
        timeSpentOnQuestion: timeSpent,
      })
    )
    trackPosthogEvent(
      captureClickFormNav({
        actionType: 'passer',
        question,
        answer: getValue(question),
        timeSpentOnQuestion: timeSpent,
      })
    )

    if (!isMissing) {
      // User has already provided an answer: reset to the model's default
      clearFromSituation([question, ...questionsOfMosaicFromParent])
    }

    // Fold with engine-computed values (model defaults after clearing)
    handleFoldWithDefaultValue()

    pendingNavigationRef.current = true
  }

  // Necessary to avoid race condition when clearing value
  useEffect(() => {
    if (pendingNavigationRef.current) {
      pendingNavigationRef.current = false
      goToNextQuestion()
    }
  })

  return (
    <div className="mt-4 mb-4 flex flex-col items-start gap-4 md:flex-row">
      <Button
        onClick={handleClick}
        className="text-sm!"
        color="borderless"
        data-testid="skip-question-button"
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
          Pas d'inquiétude, on prend des données moyennes pour garder les
          résultats fiables.
        </Trans>
      </p>
    </div>
  )
}
