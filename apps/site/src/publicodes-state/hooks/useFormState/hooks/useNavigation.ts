import getNamespace from '@/publicodes-state/helpers/getNamespace'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useMemo } from 'react'

interface Props {
  remainingQuestions: DottedName[]
  relevantQuestions: DottedName[]
  currentQuestion: DottedName | null
  setCurrentQuestion: (question: DottedName | null) => void
}

export default function useNavigation({
  remainingQuestions,
  relevantQuestions,
  currentQuestion,
  setCurrentQuestion,
}: Props) {
  const currentQuestionNamespace = useMemo(
    () => getNamespace(currentQuestion),
    [currentQuestion]
  )

  const currentQuestionIndex = useMemo<number>(
    () => (currentQuestion ? relevantQuestions?.indexOf(currentQuestion) : 0),
    [relevantQuestions, currentQuestion]
  )

  const noPrevQuestion = useMemo<boolean>(
    () => currentQuestionIndex === 0,
    [currentQuestionIndex]
  )

  const noNextQuestion = useMemo<boolean>(
    () =>
      remainingQuestions.length === 0 ||
      (remainingQuestions.length === 1 &&
        remainingQuestions[0] === currentQuestion),
    [currentQuestion, remainingQuestions]
  )

  const isLastQuestionOfCategory = useMemo<boolean>(
    () =>
      getNamespace(relevantQuestions[currentQuestionIndex + 1]) !==
      currentQuestionNamespace,
    [currentQuestionNamespace, currentQuestionIndex, relevantQuestions]
  )

  const isFirstQuestionOfCategory = useMemo<boolean>(
    () =>
      getNamespace(relevantQuestions[currentQuestionIndex - 1]) !==
      currentQuestionNamespace,
    [currentQuestionNamespace, currentQuestionIndex, relevantQuestions]
  )

  const testAdvancement = useMemo(() => {
    const index = relevantQuestions.findIndex(
      (question) => question === currentQuestion
    )

    return index === -1 ? 0 : index / relevantQuestions.length
  }, [currentQuestion, relevantQuestions])

  const gotoPrevQuestion = () => {
    if (noPrevQuestion) {
      return undefined
    }

    const newCurrentQuestion = relevantQuestions[currentQuestionIndex - 1]

    setCurrentQuestion(newCurrentQuestion)

    return newCurrentQuestion
  }

  const gotoNextQuestion = () => {
    if (noNextQuestion) {
      return undefined
    }

    const newCurrentQuestion =
      relevantQuestions[currentQuestionIndex + 1] || remainingQuestions[0]

    setCurrentQuestion(newCurrentQuestion)

    return newCurrentQuestion
  }

  return {
    gotoPrevQuestion,
    gotoNextQuestion,
    noPrevQuestion,
    noNextQuestion,
    isFirstQuestionOfCategory,
    isLastQuestionOfCategory,
    testAdvancement,
  }
}
