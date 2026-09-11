import { getLinkToSimulateur } from '@/helpers/navigation/simulateurPages'
import { useDebug } from '@/hooks/useDebug'
import getNamespace from '@/publicodes-state/helpers/getNamespace'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat/types/dottedNames'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export const useCurrent = (
  relevantAnsweredQuestions: DottedName[],
  remainingQuestions: DottedName[]
) => {
  const isDebug = useDebug()
  const questionInQueryParams = useQuestionInQueryParams()
  const pathname = usePathname()
  const nextQuestion = remainingQuestions.at(0)
  const lastQuestion = relevantAnsweredQuestions.at(-1)
  const defaultCurrentQuestion = pathname.includes('intercalaire')
    ? lastQuestion
    : questionInQueryParams &&
        (relevantAnsweredQuestions.includes(questionInQueryParams) || isDebug)
      ? questionInQueryParams
      : nextQuestion
  const [currentQuestion, setCurrentQuestion] = useState(
    defaultCurrentQuestion ?? null
  )

  const currentCategory = useMemo(() => {
    return getNamespace(currentQuestion) ?? null
  }, [currentQuestion])

  return { currentQuestion, setCurrentQuestion, currentCategory }
}

const useQuestionInQueryParams = () => {
  const searchParams = useSearchParams()
  const question = searchParams.get('question')
  if (!question) return
  const questionInQueryParams = decodeURI(question)
    .replaceAll('.', ' . ')
    .replaceAll('_', ' ') as DottedName
  return questionInQueryParams
}

export const useSyncQuestionWithQueryParams = (
  currentQuestion: DottedName | null
) => {
  const searchParams = useSearchParams()
  useEffect(() => {
    if (!currentQuestion) return
    window.history.replaceState(
      null,
      '',
      getLinkToSimulateur({ question: currentQuestion, searchParams })
    )
  }, [currentQuestion])
}
