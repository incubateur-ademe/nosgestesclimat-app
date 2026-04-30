import getNamespace from '@/publicodes-state/helpers/getNamespace'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useMemo } from 'react'

interface Props {
  relevantQuestions: DottedName[]
  currentQuestion: DottedName | null
  setCurrentQuestion: (question: DottedName | null) => void
}

export default function useNavigation({
  relevantQuestions,
  currentQuestion,
  setCurrentQuestion,
}: Props) {
  return useMemo(() => {
    const currentQuestionNamespace = getNamespace(currentQuestion)

    const currentQuestionIndex: number = currentQuestion
      ? relevantQuestions.indexOf(currentQuestion)
      : 0

    const noPrevQuestion = currentQuestionIndex === 0

    const noNextQuestion = currentQuestionIndex >= relevantQuestions.length - 1

    const nextQuestion: DottedName | null =
      relevantQuestions[currentQuestionIndex + 1]
    const previousQuestion: DottedName | null =
      relevantQuestions[currentQuestionIndex - 1]

    const isLastQuestionOfCategory =
      getNamespace(nextQuestion) !== currentQuestionNamespace

    const isFirstQuestionOfCategory =
      getNamespace(previousQuestion) !== currentQuestionNamespace

    const index = relevantQuestions.findIndex(
      (question) => question === currentQuestion
    )

    const testAdvancement = index === -1 ? 0 : index / relevantQuestions.length

    function gotoPrevQuestion() {
      if (noPrevQuestion) {
        return undefined
      }
      setCurrentQuestion(previousQuestion)
      return previousQuestion
    }

    function gotoNextQuestion() {
      if (noNextQuestion) {
        return undefined
      }

      setCurrentQuestion(nextQuestion)
      return nextQuestion
    }

    return {
      currentQuestionNamespace,
      currentQuestionIndex,
      noPrevQuestion,
      noNextQuestion,
      isLastQuestionOfCategory,
      isFirstQuestionOfCategory,
      testAdvancement,
      nextQuestion,
      previousQuestion,
      gotoPrevQuestion,
      gotoNextQuestion,
    }
  }, [currentQuestion, relevantQuestions, setCurrentQuestion])
}
