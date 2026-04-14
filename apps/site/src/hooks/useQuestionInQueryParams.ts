import { getLinkToSimulateur } from '@/helpers/navigation/simulateurPages'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { useLocale } from './useLocale'

export const useQuestionInQueryParams = (
  currentQuestion?: DottedName | null
) => {
  const router = useRouter()

  const searchParams = useSearchParams()

  const locale = useLocale()
  const question = searchParams.get('question')
  const questionInQueryParams = decodeURI(question || '')
    ?.replaceAll('.', ' . ')
    .replaceAll('_', ' ') as DottedName

  const setQuestionInQueryParams = useCallback(
    (question: DottedName) => {
      router.replace(
        getLinkToSimulateur({
          question,
          locale,
          searchParams,
        }),
        { scroll: false }
      )
    },
    [router, locale, searchParams]
  )

  useEffect(() => {
    if (currentQuestion && questionInQueryParams !== currentQuestion)
      setQuestionInQueryParams(currentQuestion)
  }, [currentQuestion, setQuestionInQueryParams, questionInQueryParams])

  return { questionInQueryParams }
}
