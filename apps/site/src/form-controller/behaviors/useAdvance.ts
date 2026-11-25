'use client'

import { useCompleteSimulation } from '@/form-controller/behaviors/useCompleteSimulation'
import {
  questionStep,
  stepCategory,
  stepToUrl,
  type Step,
} from '@/form-controller/core/steps'
import { useFormController } from '@/form-controller/core/useFormController'
import { getSimulationMode } from '@/helpers/server/model/simulations'
import { useOptionalSimulation } from '@/publicodes-state'
import getNamespace from '@/publicodes-state/helpers/getNamespace'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

/**
 * The single "move forward" authority: where the form goes next (the
 * intercalaire of the category just finished, the next question, or the end)
 * and how to get there. `next` and `skip` both go through it.
 */
export function useAdvance() {
  const {
    currentStep,
    navigate,
    getCurrentStep,
    relevantQuestions,
    relevantAnsweredQuestions,
  } = useFormController()
  const router = useRouter()
  const searchParams = useSearchParams()
  const simulation = useOptionalSimulation()
  const withIntercalaire = getSimulationMode(simulation) === 'scolaire'
  const { completeSimulation } = useCompleteSimulation()

  /** Where the form goes after `step`, or undefined when it is the end. */
  const stepAfter = useCallback(
    (step: Step | undefined): Step | undefined => {
      if (!step || step.kind === 'end') return undefined

      // An intercalaire sits right before the questions of the category it
      // opens: leaving it resumes at the frontier.
      if (step.kind === 'intercalaire') {
        const frontier = relevantQuestions.find(
          (question) => !relevantAnsweredQuestions.includes(question)
        )
        return frontier ? questionStep(frontier) : undefined
      }

      const index = relevantQuestions.indexOf(step.question)
      const nextQuestion = relevantQuestions.at(index + 1)
      const category = stepCategory(step)
      const opensNewCategory =
        withIntercalaire &&
        nextQuestion !== undefined &&
        getNamespace(nextQuestion) !== category &&
        !relevantAnsweredQuestions.includes(nextQuestion)

      if (opensNewCategory && category) {
        return { kind: 'intercalaire', category }
      }
      return nextQuestion ? questionStep(nextQuestion) : undefined
    },
    [relevantQuestions, relevantAnsweredQuestions, withIntercalaire]
  )

  const advance = useCallback(() => {
    // Read the step now, not at render time: a held key calls this several
    // times before React re-renders, and each call must start where the
    // previous one landed.
    const currentStep = getCurrentStep()
    const nextStep = stepAfter(currentStep)

    if (!nextStep) {
      completeSimulation()
      return
    }
    // The intercalaire is its own route: entering or leaving it needs the
    // server tree, so both go through the router.
    if (
      nextStep.kind === 'intercalaire' ||
      currentStep?.kind === 'intercalaire'
    ) {
      router.push(stepToUrl(nextStep, searchParams)!)
      return
    }
    navigate(nextStep)
  }, [
    stepAfter,
    getCurrentStep,
    completeSimulation,
    router,
    searchParams,
    navigate,
  ])

  const nextStep = useMemo(
    () => stepAfter(currentStep),
    [stepAfter, currentStep]
  )

  return { advance, nextStep }
}
