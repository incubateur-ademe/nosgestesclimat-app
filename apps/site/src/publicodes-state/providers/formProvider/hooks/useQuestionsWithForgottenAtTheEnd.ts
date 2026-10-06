import getQuestionsWithForgottenAtTheEnd from '@/publicodes-state/helpers/getQuestionsWithForgottenAtTheEnd'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useEffect, useState } from 'react'

interface Props {
  relevantQuestions: DottedName[]
  remainingQuestions: DottedName[]
  currentQuestion: DottedName | null
}

/**
 * Moves the "forgotten" questions at the end of the form.
 *
 * A forgotten question is a question that is still missing while it is placed
 * before the question the user is on: going forward would never ask it and the
 * progression could never reach 100%. This can happen when a publicodes rule
 * (buggy or with a late condition) triggers a missing variable for a question
 * placed before the one being answered.
 *
 * The forgotten questions are remembered across renders: a question that has
 * been moved at the end stays there, even once it has been answered, otherwise
 * it would go back to its original position in the middle of the form.
 */
export default function useQuestionsWithForgottenAtTheEnd({
  relevantQuestions,
  remainingQuestions,
  currentQuestion,
}: Props) {
  const [previousForgottenQuestions, setPreviousForgottenQuestions] = useState<
    DottedName[]
  >([])

  const result = getQuestionsWithForgottenAtTheEnd({
    relevantQuestions,
    remainingQuestions,
    currentQuestion,
    previousForgottenQuestions,
  })

  const forgottenQuestionsKey = result.forgottenQuestions.join(',')

  // Remember the forgotten questions for the next renders. The key comparison
  // avoids a state update (and thus an extra render) when the list is unchanged.
  useEffect(() => {
    setPreviousForgottenQuestions((previous) =>
      previous.join(',') === forgottenQuestionsKey
        ? previous
        : result.forgottenQuestions
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forgottenQuestionsKey])

  return result
}
