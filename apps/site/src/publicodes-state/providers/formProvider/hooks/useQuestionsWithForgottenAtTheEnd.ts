import getQuestionsWithForgottenAtTheEnd from '@/publicodes-state/helpers/getQuestionsWithForgottenAtTheEnd'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useEffect, useMemo, useState } from 'react'

interface Props {
  relevantQuestions: DottedName[]
  remainingQuestions: DottedName[]
  currentQuestion: DottedName | null
}

/**
 * Detects forgotten questions only when the base form reaches its last
 * question, then keeps them at the end for the rest of the session.
 */
export default function useQuestionsWithForgottenAtTheEnd({
  relevantQuestions,
  remainingQuestions,
  currentQuestion,
}: Props) {
  const [forgottenQuestions, setForgottenQuestions] = useState<DottedName[]>([])

  const newlyForgottenQuestions: DottedName[] = useMemo(
    () =>
      getQuestionsWithForgottenAtTheEnd({
        relevantQuestions,
        remainingQuestions,
        currentQuestion,
        forgottenQuestions,
      }),
    [relevantQuestions, remainingQuestions, currentQuestion, forgottenQuestions]
  )

  const allForgottenQuestions: DottedName[] = useMemo(
    () => [
      ...forgottenQuestions,
      ...newlyForgottenQuestions.filter(
        (question) => !forgottenQuestions.includes(question)
      ),
    ],
    [forgottenQuestions, newlyForgottenQuestions]
  )

  useEffect(() => {
    if (newlyForgottenQuestions.length === 0) return

    // This effect persists questions discovered after the render that reaches
    // the end of the base form. The update is guarded below to avoid loops.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForgottenQuestions((previous) => {
      const newQuestions: DottedName[] = newlyForgottenQuestions.filter(
        (question) => !previous.includes(question)
      )

      if (newQuestions.length === 0) return previous

      return [...previous, ...newQuestions]
    })
  }, [newlyForgottenQuestions])

  const forgottenQuestionsSet = useMemo(
    () => new Set(allForgottenQuestions),
    [allForgottenQuestions]
  )

  const moveForgottenToTheEnd = (questions: DottedName[]) => [
    ...questions.filter((question) => !forgottenQuestionsSet.has(question)),
    ...questions.filter((question) => forgottenQuestionsSet.has(question)),
  ]

  return {
    relevantQuestions: moveForgottenToTheEnd(relevantQuestions),
    remainingQuestions: moveForgottenToTheEnd(remainingQuestions),
    forgottenQuestions: allForgottenQuestions,
  }
}
