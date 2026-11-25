import { LAST_QUESTIONS } from '@/publicodes-state/constants/questions'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

/**
 * Moves the two last questions of the test to the end of the list, keeping
 * their order. Applied after every sort so they always stay the last two.
 */
export default function moveLastQuestionsToTheEnd(
  questions: DottedName[]
): DottedName[] {
  const otherQuestions = questions.filter(
    (question) => !LAST_QUESTIONS.includes(question)
  )

  const lastQuestions = LAST_QUESTIONS.filter((question) =>
    questions.includes(question)
  )

  return [...otherQuestions, ...lastQuestions]
}
