'use client'

import {
  EMPTY_FOLDED_STEPS,
  EMPTY_SITUATION,
  useEngine,
  useOptionalSimulation,
  useUser,
} from '@/publicodes-state'

import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { notFound } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'
import FormContext from './context'
import { useCurrent } from './hooks/useCurrent'
import useProgression from './hooks/useProgression'
import useQuestions from './hooks/useQuestions'

interface Props {
  root: DottedName
}

function FormProvider({ root, children }: PropsWithChildren<Props>) {
  const {
    categories,
    subcategories,
    safeEvaluate,
    everyQuestions,
    everyMosaicChildrenWithParent,
  } = useEngine()

  // Also reached from the actions detail routes, where there may be no simulation.
  const simulation = useOptionalSimulation()
  const situation = simulation?.situation ?? EMPTY_SITUATION
  const foldedSteps = simulation?.foldedSteps ?? EMPTY_FOLDED_STEPS
  const storedProgression = simulation?.progression
  const { updateCurrentSimulation } = useUser()

  const {
    remainingQuestions,
    relevantAnsweredQuestions,
    relevantQuestions,
    questionsByCategories,
    missingVariables,
  } = useQuestions({
    root,
    safeEvaluate,
    categories,
    subcategories,
    foldedSteps,
    situation,
    everyQuestions,
    everyMosaicChildrenWithParent,
  })

  const { currentQuestion, setCurrentQuestion, currentCategory } = useCurrent(
    relevantAnsweredQuestions,
    remainingQuestions
  )

  const { remainingQuestionsByCategories, progression } = useProgression({
    categories,
    remainingQuestions,
    relevantQuestions,
    updateCurrentSimulation,
    currentStoredProgression: storedProgression,
  })

  return (
    <FormContext.Provider
      value={{
        questionsByCategories,
        relevantQuestions,
        remainingQuestions,
        relevantAnsweredQuestions,
        remainingQuestionsByCategories,
        currentQuestion,
        currentCategory,
        setCurrentQuestion,
        missingVariables,
        progression,
      }}>
      {children}
    </FormContext.Provider>
  )
}

/**
 * This is not the real provider but a failsafe: if root is invalid we do not go further
 */
export default function FailSafeFormProvider({
  root = 'bilan',
  children,
}: PropsWithChildren<{
  root?: DottedName
}>) {
  const { safeEvaluate, rules, engine } = useEngine()

  const isRootSafe = useMemo<boolean>(() => {
    if (!rules || !engine) return true

    return safeEvaluate(root) ? true : false
  }, [safeEvaluate, root, rules, engine])

  if (!isRootSafe) {
    notFound()
  }
  return <FormProvider root={root}>{children}</FormProvider>
}
