import { SIMULATOR_INTERCALAIRE_PATH } from '@/constants/urls/paths'
import { getSimulationMode } from '@/helpers/server/model/simulations'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useRouter } from 'next/navigation'
import useCurrentSimulation from '../useCurrentSimulation/useCurrentSimulation'
import useFormState from '../useFormState/useFormState'

interface Props {
  isEmbedded?: boolean
  question: DottedName
}

export function useGotoNextQuestion({ isEmbedded, question }: Props) {
  const {
    gotoNextQuestion,
    noNextQuestion,
    isLastQuestionOfCategory,
    nextQuestionAlreadySeen,
    currentCategory,
    remainingQuestions,
  } = useFormState()
  const router = useRouter()

  // Determines if the current question is the last one of the test
  const isLastQuestion = isEmbedded
    ? (remainingQuestions.length === 1 && remainingQuestions[0] === question) ||
      remainingQuestions.length === 0
    : noNextQuestion

  const withIntercalaire =
    getSimulationMode(useCurrentSimulation()) === 'scolaire'

  const isIntercalaireNext =
    withIntercalaire && isLastQuestionOfCategory && !nextQuestionAlreadySeen

  return {
    goToNextQuestion: () => {
      if (withIntercalaire && isIntercalaireNext) {
        const encodedQuestion = encodeURIComponent(
          question.replaceAll(' . ', '.').replaceAll(' ', '_')
        )
        return router.push(
          `${SIMULATOR_INTERCALAIRE_PATH}/${currentCategory}?question=${encodedQuestion}`
        )
      } else {
        gotoNextQuestion()
      }
    },
    isLastQuestion,
    isIntercalaireNext,
  }
}
