import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

interface Props {
  /**
   * The base (sorted) order of every relevant question
   */
  relevantQuestions: DottedName[]
  /**
   * Every question that is still missing
   */
  remainingQuestions: DottedName[]
  /**
   * The question the user is currently on. It is the anchor used to detect the
   * forgotten questions
   */
  currentQuestion: DottedName | null
  /**
   * The forgotten questions detected on the previous renders
   */
  previousForgottenQuestions?: DottedName[]
}

interface Result {
  /**
   * The relevant questions with the "forgotten" ones moved at the end
   */
  relevantQuestions: DottedName[]
  /**
   * The remaining questions with the "forgotten" ones moved at the end
   */
  remainingQuestions: DottedName[]
  /**
   * Every forgotten question, in the base order
   */
  forgottenQuestions: DottedName[]
}

/**
 * A question is "forgotten" when it is still missing while it should already
 * have been asked, i.e. it is placed before the question the user is on.
 *
 * This may happen when a publicodes rule (buggy or with a late condition)
 * triggers a missing variable for a question placed before the one currently
 * being answered: going forward would never ask it and the progression could
 * never reach 100%. Such questions are moved at the end of the form.
 *
 * The anchor is the question the user is on, and not the last answered one.
 * This is what makes the questions opened by a new answer appear right after
 * it: when the user goes back with "précédent" to change an answer, the anchor
 * follows the navigation, so the new questions are not considered as forgotten.
 *
 * When the user is on a question that is itself forgotten (thus displayed at
 * the end of the form), every remaining question is moved to the end too, so
 * that they are asked after it instead of being skipped.
 *
 * `previousForgottenQuestions` remembers the questions already detected as
 * forgotten: a forgotten question stays at the end of the form even once it has
 * been answered, otherwise answering it would send it back to the middle of the
 * form and the user would never reach the end of the test. A question is
 * forgotten again in the base order as soon as the user goes back before it.
 */
export default function getQuestionsWithForgottenAtTheEnd({
  relevantQuestions,
  remainingQuestions,
  currentQuestion,
  previousForgottenQuestions = [],
}: Props): Result {
  const baseIndexOf = (question: DottedName) =>
    relevantQuestions.indexOf(question)

  const remainingQuestionsSet = new Set<DottedName>(remainingQuestions)
  const forgottenQuestionsSet = new Set<DottedName>()

  const currentQuestionIndex = currentQuestion
    ? baseIndexOf(currentQuestion)
    : -1

  // A question already forgotten stays forgotten as long as the user did not go
  // back before it: it is then asked again in the base order.
  previousForgottenQuestions.forEach((question) => {
    const index = baseIndexOf(question)

    if (index === -1) return

    if (currentQuestionIndex === -1 || index <= currentQuestionIndex) {
      forgottenQuestionsSet.add(question)
    }
  })

  // Every still missing question placed before the current one has already been
  // passed by the form: going forward would never ask it, so it is asked at the
  // end instead.
  if (currentQuestionIndex > 0) {
    relevantQuestions.forEach((question, index) => {
      if (index < currentQuestionIndex && remainingQuestionsSet.has(question)) {
        forgottenQuestionsSet.add(question)
      }
    })
  }

  const forgottenQuestions = relevantQuestions.filter((question) =>
    forgottenQuestionsSet.has(question)
  )

  // When the user is on a forgotten question (displayed at the end of the form),
  // every remaining question has to be asked after it: otherwise they would be
  // skipped when going forward.
  const isOnForgottenQuestion =
    !!currentQuestion && forgottenQuestionsSet.has(currentQuestion)

  const questionsToMove = new Set<DottedName>(forgottenQuestions)

  if (isOnForgottenQuestion) {
    remainingQuestions.forEach((question) => questionsToMove.add(question))
  }

  if (questionsToMove.size === 0) {
    return { relevantQuestions, remainingQuestions, forgottenQuestions }
  }

  const moveQuestionsToTheEnd = (questions: DottedName[]) => {
    const keptQuestions = questions.filter(
      (question) => !questionsToMove.has(question)
    )
    const movedQuestions = questions.filter((question) =>
      questionsToMove.has(question)
    )

    // The current question must be asked before the other moved ones, otherwise
    // going forward would skip them.
    const currentQuestionInMovedQuestions = currentQuestion
      ? movedQuestions.indexOf(currentQuestion)
      : -1

    if (currentQuestionInMovedQuestions > 0) {
      movedQuestions.unshift(
        ...movedQuestions.splice(currentQuestionInMovedQuestions, 1)
      )
    }

    return [...keptQuestions, ...movedQuestions]
  }

  return {
    relevantQuestions: moveQuestionsToTheEnd(relevantQuestions),
    remainingQuestions: moveQuestionsToTheEnd(remainingQuestions),
    forgottenQuestions,
  }
}
