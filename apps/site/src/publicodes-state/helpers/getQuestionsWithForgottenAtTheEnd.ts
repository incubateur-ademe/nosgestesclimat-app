import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

interface Props {
  relevantQuestions: DottedName[]
  remainingQuestions: DottedName[]
  currentQuestion: DottedName | null
  forgottenQuestions?: DottedName[]
}

/**
 * Computes the missing questions that were skipped by the base form order.
 * This is intentionally only meaningful when the current question is the last
 * question in that order: before then, a missing question may still be opened
 * by an answer after going back in the form.
 */
export default function getQuestionsWithForgottenAtTheEnd({
  relevantQuestions,
  remainingQuestions,
  currentQuestion,
  forgottenQuestions = [],
}: Props): DottedName[] {
  if (
    !currentQuestion ||
    (relevantQuestions.at(-1) !== currentQuestion &&
      !forgottenQuestions.includes(currentQuestion))
  ) {
    return []
  }

  // Once a forgotten question is being answered at the end of the form, any
  // new missing question it opens belongs to the same final block, regardless
  // of its position in the base order.
  if (forgottenQuestions.includes(currentQuestion)) {
    return remainingQuestions.filter(
      (question) => !forgottenQuestions.includes(question)
    )
  }

  const currentQuestionIndex = relevantQuestions.indexOf(currentQuestion)

  return remainingQuestions.filter(
    (question) => relevantQuestions.indexOf(question) < currentQuestionIndex
  )
}
