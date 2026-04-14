import type { UpdateCurrentSimulationProps } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

interface Props {
  question: DottedName
  relevantQuestions: DottedName[]
  updateCurrentSimulation: (simulation: UpdateCurrentSimulationProps) => void
}

export function foldEveryQuestionsUntil({
  question,
  relevantQuestions,
  updateCurrentSimulation,
}: Props) {
  const indexOfQuestion = relevantQuestions.indexOf(question)
  const questionsToAnswer = relevantQuestions.slice(0, indexOfQuestion)
  questionsToAnswer.map((question) =>
    updateCurrentSimulation({
      foldedStepToAdd: { foldedStep: question, value: null },
    })
  )
}
