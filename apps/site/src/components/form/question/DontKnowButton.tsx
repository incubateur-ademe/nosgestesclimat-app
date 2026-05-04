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
import type { Situation } from '@/publicodes-state/types'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import type { DottedName, NodeValue } from '@incubateur-ademe/nosgestesclimat'
import { useCallback } from 'react'

interface Props {
  question: DottedName
}

export default function DontKnowButton({ question }: Props) {
  const { gotoNextQuestion } = useFormState()

  const { t } = useClientTranslation()

  const { updateCurrentSimulation, situation } = useCurrentSimulation()

  const { questionsOfMosaicFromParent, isMissing } = useRule(question)

  const { getValue, engine } = useEngine()


  // @TODO: refacto this with the logic from https://github.com/incubateur-ademe/nosgestesclimat-site-nextjs/blob/ddf31819dfb0628c0e883cec90113cb2f823afe0/apps/site/src/components/form/Navigation.tsx#L240-L311
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

    if (!isMissing) {
      // User has already provided an answer: reset to the model's default value
      const cleanedSituation = { ...situation }
      const dottedNamesToRemove: DottedName[] = [
        question,
        ...questionsOfMosaicFromParent,
      ]
      dottedNamesToRemove.forEach((name) => {
        delete cleanedSituation[name]
      })

      // Create a temporary engine with the cleaned situation to compute defaults
      const tempEngine = engine?.shallowCopy()
      if (tempEngine) {
        tempEngine.setSituation(cleanedSituation, {
          keepPreviousSituation: false,
        })
      }

      // Fold mosaic children with their computed default values
      if (questionsOfMosaicFromParent.length > 0) {
        questionsOfMosaicFromParent.forEach((mosaicChild) => {
          const defaultValue: NodeValue | undefined =
            tempEngine!.evaluate(mosaicChild).nodeValue

          updateCurrentSimulation({
            foldedStepToAdd: {
              foldedStep: mosaicChild,
              value: defaultValue,
              isMosaicChild: true,
            },
          })
        })
      }

      // Compute the default value for the main question
      const defaultValue: NodeValue | undefined =
        tempEngine!.evaluate(question).nodeValue

      // Sync the main engine with the cleaned situation so that
      // computedResults are recalculated with the correct default values
      engine?.setSituation(cleanedSituation as Situation)

      // Clean the situation and fold the main question with its default value
      updateCurrentSimulation({
        situation: cleanedSituation as Situation,
        foldedStepToAdd: {
          foldedStep: question,
          value: defaultValue,
          isMosaicParent: questionsOfMosaicFromParent.length > 0,
        },
      })
    } else {
      // No answer provided: fold with current engine value (the model default)
      handleFoldWithDefaultValue()
    }

    gotoNextQuestion()
  }

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
