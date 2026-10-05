import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

interface Props {
  relevantQuestions: DottedName[]
  remainingQuestions: DottedName[]
  relevantAnsweredQuestions: DottedName[]
}

/**
 * A question is "forgotten" when it is still missing while it should already
 * have been asked, i.e. it is placed before the last answered question in the
 * base order.
 *
 * This may happen when a publicodes rule (buggy or with a late condition)
 * triggers a missing variable for a question that is placed before the one
 * currently being answered. Left as is, the user could be sent back in the
 * middle of the form while clicking "next" and the progression could never
 * reach 100%.
 *
 * We detect those questions and move them at the end of the form, where they
 * will be asked in the order they appear.
 *
 * "Forgotten" covers two cases:
 * - a still missing question placed before the last answered question: it should
 *   already have been asked;
 * - a question that has been answered out of the base order, i.e. answered while another question placed after it had already been answered.
 */
export default function getQuestionsWithForgottenAtTheEnd({
  relevantQuestions,
  remainingQuestions,
  relevantAnsweredQuestions,
}: Props): {
  relevantQuestions: DottedName[]
  remainingQuestions: DottedName[]
  forgottenQuestions: DottedName[]
} {
  const baseIndexOf = (question: DottedName) =>
    relevantQuestions.indexOf(question)

  const forgottenQuestionsSet = new Set<DottedName>()

  let lastAnsweredIndex = -1

  relevantAnsweredQuestions.forEach((question) => {
    const index = baseIndexOf(question)

    if (index === -1) return

    if (index < lastAnsweredIndex) {
      forgottenQuestionsSet.add(question)
    }

    lastAnsweredIndex = Math.max(lastAnsweredIndex, index)
  })

  // Every still missing question placed before the last answered one has been
  // "forgotten" too.
  remainingQuestions.forEach((question) => {
    const index = baseIndexOf(question)

    if (index !== -1 && index < lastAnsweredIndex) {
      forgottenQuestionsSet.add(question)
    }
  })

  if (forgottenQuestionsSet.size === 0) {
    return { relevantQuestions, remainingQuestions, forgottenQuestions: [] }
  }

  const moveForgottenToTheEnd = (questions: DottedName[]) => [
    ...questions.filter((question) => !forgottenQuestionsSet.has(question)),
    ...questions.filter((question) => forgottenQuestionsSet.has(question)),
  ]

  return {
    relevantQuestions: moveForgottenToTheEnd(relevantQuestions),
    remainingQuestions: moveForgottenToTheEnd(remainingQuestions),
    forgottenQuestions: Array.from(forgottenQuestionsSet),
  }
}
