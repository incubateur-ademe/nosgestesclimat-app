'use client'

import {
  DEFAULT_FOCUS_ELEMENT_ID,
  QUESTION_DESCRIPTION_BUTTON_ID,
} from '@/constants/accessibility'
import { captureClickFormNav } from '@/constants/tracking/trackers'
import { useAdvance } from '@/form-controller/behaviors/useAdvance'
import { useCompleteSimulation } from '@/form-controller/behaviors/useCompleteSimulation'
import {
  questionStep,
  questionUrl,
  stepCategory,
} from '@/form-controller/core/steps'
import { useFormController } from '@/form-controller/core/useFormController'
import { useDrafts } from '@/form-controller/drafts/useDrafts'
import { useFormWriteService } from '@/form-controller/write-service/useFormWriteService'
import { useDebug } from '@/hooks/useDebug'
import { useEngine, useRule } from '@/publicodes-state'
import { trackEvent } from '@/utils/analytics/trackEvent'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export type SubmitButtonKind = 'loading' | 'finish' | 'next'

interface NavEvent {
  preventDefault: () => void
}

/**
 * The form's single navigation authority: one next/prev/skip/goto, plus the
 * per-question behaviors (commit pending draft, fold a skipped question, reset
 * notifications, tracking, focus, magic keys). The current step comes from the
 * URL; navigation pushes the target step's URL via `stepToUrl`. Intercalaire and
 * the end are steps like any other. Views only render buttons and call these
 * actions; the decision signals stay internal and surface as `kind`,
 * `isDisabled` and the target `step`.
 */
export function useFormNavigation() {
  const {
    currentStep,
    navigate,
    currentQuestion,
    relevantQuestions,
    forgottenQuestions,
    isNextDisabled,
  } = useFormController()

  const router = useRouter()
  const searchParams = useSearchParams()
  const isDebug = useDebug()

  // On an intercalaire the reference question is the last answered one.
  const question = currentQuestion ?? ('bilan' as DottedName)
  // Drafts are grouped by step: a custom question's nested edits belong to the
  // question being asked, so leaving commits them all.
  const step = currentQuestion

  const { isMissing, isFolded, value, activeNotifications } = useRule(question)
  const { flush, discard } = useDrafts()
  const { setValue, foldQuestion } = useFormWriteService()
  const { getValue } = useEngine()
  const { isPending } = useCompleteSimulation()
  const { advance, nextStep } = useAdvance()

  const index = currentQuestion
    ? relevantQuestions.indexOf(currentQuestion)
    : -1
  const prevQuestion = relevantQuestions[index - 1] ?? null
  const isLastQuestion = index >= relevantQuestions.length - 1
  const hasNoPreviousQuestion =
    currentStep?.kind === 'intercalaire' ? false : index === 0

  const canNavigateFromAnsweredForgottenQuestion =
    forgottenQuestions.includes(question) && !isMissing

  const [startTime, setStartTime] = useState(() => Date.now())
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the tracking clock when the question changes
    setStartTime(Date.now())
  }, [question])

  const resetNotification = useCallback(() => {
    if (activeNotifications.length > 0) {
      setValue(activeNotifications[activeNotifications.length - 1], false)
    }
  }, [activeNotifications, setValue])

  const handleMoveFocus = () => {
    setTimeout(() => {
      const focusedElement =
        document.getElementById(QUESTION_DESCRIPTION_BUTTON_ID) ??
        document.getElementById(DEFAULT_FOCUS_ELEMENT_ID) ??
        document.getElementById(`${DEFAULT_FOCUS_ELEMENT_ID}-0`)
      if (focusedElement) focusedElement.focus()
    })
  }

  // Commit any pending edit before leaving so the last keystroke is not lost;
  // a committed question is already folded, so only fold when nothing flushed.
  const commitPendingThenFoldIfMissing = useCallback(() => {
    const flushed = step ? flush(step) : false
    if (isMissing && !flushed) foldQuestion({ dottedName: question })
  }, [flush, step, isMissing, foldQuestion, question])

  const skipQuestion = useCallback(
    (questionToSkip: DottedName) => {
      trackEvent(
        captureClickFormNav({
          actionType: 'passer',
          question: questionToSkip,
          answer: getValue(questionToSkip),
          // Dummy time for AB test
          timeSpentOnQuestion: 0,
        })
      )
      if (step) discard(step)
      foldQuestion({ dottedName: questionToSkip })
      advance()
    },
    [getValue, step, discard, foldQuestion, advance]
  )

  const next = useCallback(
    (e?: NavEvent) => {
      e?.preventDefault()
      // On an intercalaire the question is already folded and nothing is
      // pending: the button only leaves the step.
      if (currentStep?.kind === 'intercalaire') {
        advance()
        return
      }
      trackEvent(
        captureClickFormNav({
          actionType: 'suivant',
          question,
          answer: value,
          timeSpentOnQuestion: Date.now() - startTime,
        })
      )
      commitPendingThenFoldIfMissing()
      handleMoveFocus()
      resetNotification()
      advance()
    },

    [
      currentStep,
      question,
      value,
      startTime,
      commitPendingThenFoldIfMissing,
      resetNotification,
      advance,
    ]
  )

  const prev = useCallback(
    (e?: NavEvent) => {
      e?.preventDefault()
      if (currentStep?.kind === 'intercalaire') {
        router.push(questionUrl(question, searchParams))
        resetNotification()
        handleMoveFocus()
        return
      }
      if (hasNoPreviousQuestion) {
        // Through the Next router, so its state follows the history entry.
        router.back()
        return
      }
      trackEvent(
        captureClickFormNav({
          actionType: 'précédent',
          question,
          answer: value,
          timeSpentOnQuestion: Date.now() - startTime,
        })
      )
      // Commit before leaving: the next question may overwrite the same rules.
      if (step) flush(step)
      navigate(questionStep(prevQuestion))
      resetNotification()
      handleMoveFocus()
    },
    [
      currentStep,
      hasNoPreviousQuestion,
      question,
      value,
      startTime,
      prevQuestion,
      resetNotification,
      flush,
      step,
      navigate,
      router,
      searchParams,
    ]
  )

  // Jumping ahead is only reachable in debug: fold everything before the
  // target so the form stays coherent, then navigate.
  const goto = useCallback(
    (target: DottedName) => {
      if (isDebug) {
        relevantQuestions
          .slice(0, relevantQuestions.indexOf(target))
          .forEach((questionToFold) =>
            foldQuestion({ dottedName: questionToFold })
          )
      }
      if (step) flush(step)
      navigate(questionStep(target))
    },
    [isDebug, relevantQuestions, foldQuestion, flush, step, navigate]
  )

  const submitKind: SubmitButtonKind = isPending
    ? 'loading'
    : isLastQuestion && !nextStep?.kind
      ? 'finish'
      : 'next'

  const submitButtonIsDisabled =
    isPending === true ||
    isNextDisabled ||
    (!isFolded && !canNavigateFromAnsweredForgottenQuestion)

  return {
    next: {
      kind: submitKind,
      go: next,
      isDisabled: submitButtonIsDisabled,
      /** The category the button leads to, when it leads to one. */
      category: nextStep ? stepCategory(nextStep) : undefined,
    },
    prev: {
      go: prev,
      isDisabled: isPending === true,
    },
    /** Skip a question: fold it with its default value and move on. */
    skipQuestion,
    goto,
  }
}
