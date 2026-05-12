import { getLinkToSimulateur } from '@/helpers/navigation/simulateurPages'
import { useDebug } from '@/hooks/useDebug'
import { useLocale } from '@/hooks/useLocale'
import getNamespace from '@/publicodes-state/helpers/getNamespace'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat/types/dottedNames'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export const useCurrent = (
  relevantAnsweredQuestions: DottedName[],
  remainingQuestions: DottedName[]
) => {
  const isDebug = useDebug()
  const questionInQueryParams = useQuestionInQueryParams()
  const defaultCurrentQuestion =
    questionInQueryParams &&
    (relevantAnsweredQuestions.includes(questionInQueryParams) || isDebug)
      ? questionInQueryParams
      : (relevantAnsweredQuestions.at(-1) ?? remainingQuestions.at(0) ?? null)

  const [currentQuestion, setCurrentQuestion] = useState(defaultCurrentQuestion)

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  useEffect(() => {
    if (!currentQuestion) return
    router.replace(
      getLinkToSimulateur({
        question: currentQuestion,
        locale,
        searchParams,
      }),
      { scroll: false }
    )
  }, [currentQuestion])
}
