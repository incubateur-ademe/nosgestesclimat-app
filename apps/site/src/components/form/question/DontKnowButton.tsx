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

const HIDE_DONT_KNOW_BUTTON_QUESTION: DottedName =
  'logement . chauffage . saisie précision consommation'

export default function DontKnowButton({ question }: Props) {
  const { gotoNextQuestion } = useFormState()

  const { t } = useClientTranslation()

  const { updateCurrentSimulation } = useCurrentSimulation()

  const { questionsOfMosaicFromParent, isMissing } = useRule(question)

  const { getValue } = useEngine()

  @TODO: refacto this with the logic from https://github.com/incubateur-ademe/nosgestesclimat-site-nextjs/blob/ddf31819dfb0628c0e883cec90113cb2f823afe0/apps/site/src/components/form/Navigation.tsx#L240-L311
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
        answer: getValue(question),
        // Dummy time for AB test
        timeSpentOnQuestion: 0,
      })
    )

    // Fold the step with the default value (skip behavior)
    handleFoldWithDefaultValue()

    gotoNextQuestion()
  }

  if (question === HIDE_DONT_KNOW_BUTTON_QUESTION) return null

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
