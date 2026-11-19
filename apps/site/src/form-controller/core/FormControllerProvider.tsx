'use client'

import { orderedTestCategoriesWithProfile } from '@/constants/model/categories'
import { useQuestionBounds } from '@/form-controller/behaviors/useQuestionBounds'
import { useTrackSimulator } from '@/form-controller/behaviors/useTrackSimulator'
import useCompletionByCategory from '@/form-controller/core/derivation/useCompletionByCategory'
import useProgression from '@/form-controller/core/derivation/useProgression'
import useQuestions from '@/form-controller/core/derivation/useQuestions'
import useQuestionsWithForgottenAtTheEnd from '@/form-controller/core/derivation/useQuestionsWithForgottenAtTheEnd'
import FormControllerContext from '@/form-controller/core/FormControllerContext'
import { stepCategory } from '@/form-controller/core/steps'
import { useAutoSaveSimulation } from '@/form-controller/core/useAutoSave'
import { useCurrentStep } from '@/form-controller/core/useCurrentStep'
import DraftContext from '@/form-controller/drafts/DraftContext'
import {
  type Draft,
  useDraftStore,
} from '@/form-controller/drafts/useDraftStore'
import { useFormWriteService } from '@/form-controller/write-service/useFormWriteService'
import { useDebug } from '@/hooks/useDebug'
import {
  EMPTY_FOLDED_STEPS,
  EMPTY_SITUATION,
  useEngine,
  useOptionalSimulation,
  useUser,
} from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { PropsWithChildren } from 'react'
import { useCallback, useMemo } from 'react'

/**
 * The form session: the question lists, the current step, the draft mirror and
 * the progression write, exposed to the public windows.
 */
function FormSession({
  root,
  children,
}: PropsWithChildren<{ root: DottedName }>) {
  const {
    subcategories,
    safeEvaluate,
    everyQuestions,
    everyMosaicChildrenWithParent,
  } = useEngine()
  const { applyPatch } = useFormWriteService()
  const { updateCurrentSimulation } = useUser()
  const simulation = useOptionalSimulation()
  const situation = simulation?.situation ?? EMPTY_SITUATION
  const foldedSteps = simulation?.foldedSteps ?? EMPTY_FOLDED_STEPS
  const isDebug = useDebug()

  // A step is what gets folded: a custom question's nested edits are its own.
  const commitDraft = useCallback(
    (step: DottedName, draft: Draft) =>
      applyPatch(draft, { questionDottedName: step }),
    [applyPatch]
  )
  const drafts = useDraftStore(commitDraft)

  const {
    remainingQuestions,
    relevantAnsweredQuestions,
    relevantQuestions,
    questionsByCategories,
    missingVariables,
  } = useQuestions({
    root,
    safeEvaluate,
    categories: orderedTestCategoriesWithProfile,
    subcategories,
    foldedSteps,
    situation,
    everyQuestions,
    everyMosaicChildrenWithParent,
  })

  const { currentStep, navigate, getCurrentStep } = useCurrentStep({
    relevantAnsweredQuestions,
    remainingQuestions,
    isDebug,
  })

  const currentQuestion =
    currentStep?.kind === 'question'
      ? currentStep.question
      : relevantAnsweredQuestions.at(-1) ?? null

  const {
    relevantQuestions: reorderedRelevantQuestions,
    remainingQuestions: reorderedRemainingQuestions,
    forgottenQuestions,
  } = useQuestionsWithForgottenAtTheEnd({
    relevantQuestions,
    remainingQuestions,
    currentQuestion,
  })

  const completionByCategory = useCompletionByCategory({
    questionsByCategories,
    remainingQuestions: reorderedRemainingQuestions,
  })

  // Bounds guard the question being asked; an intercalaire asks none.
  const { isNextDisabled } = useQuestionBounds(
    currentStep?.kind === 'question' ? currentStep.question : null,
    drafts
  )

  const advancement = useMemo(() => {
    if (!currentQuestion) return 0
    const index = reorderedRelevantQuestions.indexOf(currentQuestion)
    return index === -1 ? 0 : index / reorderedRelevantQuestions.length
  }, [currentQuestion, reorderedRelevantQuestions])

  useProgression({
    remainingQuestions: reorderedRemainingQuestions,
    relevantQuestions: reorderedRelevantQuestions,
    updateCurrentSimulation,
    currentStoredProgression: simulation?.progression,
  })

  // Saving and tracking are form policies: they follow the answers wherever
  // the form is taken, intercalaire included.
  useAutoSaveSimulation()
  useTrackSimulator()

  return (
    <DraftContext.Provider value={drafts}>
      <FormControllerContext.Provider
        value={{
          currentStep,
          navigate,
          getCurrentStep,
          currentQuestion,
          currentCategory: currentStep ? stepCategory(currentStep) : undefined,
          advancement,
          completionByCategory,
          relevantQuestions: reorderedRelevantQuestions,
          remainingQuestions: reorderedRemainingQuestions,
          relevantAnsweredQuestions,
          questionsByCategories,
          missingVariables,
          forgottenQuestions,
          isNextDisabled,
        }}>
        {children}
      </FormControllerContext.Provider>
    </DraftContext.Provider>
  )
}

/** The form controller. A root rule that cannot be evaluated is a bug. */
export default function FormControllerProvider({
  root = 'bilan',
  children,
}: PropsWithChildren<{ root?: DottedName }>) {
  const { safeEvaluate, engine } = useEngine()

  // No engine on the server: there is nothing to evaluate yet.
  const isRootSafe = useMemo(
    () => !engine || Boolean(safeEvaluate(root)),
    [engine, safeEvaluate, root]
  )

  if (!isRootSafe) {
    throw new Error(`The root rule "${root}" could not be evaluated`)
  }
  return <FormSession root={root}>{children}</FormSession>
}
