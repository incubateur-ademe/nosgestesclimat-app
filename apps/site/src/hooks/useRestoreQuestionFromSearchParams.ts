import { useFormState } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function useRestoreQuestionFromSearchParams() {
  const searchParams = useSearchParams()

  const { currentQuestion, setCurrentQuestion } = useFormState()

  const questionFromUrl = decodeURI(searchParams.get('question') ?? '')
    .replaceAll('.', ' . ')
    .replaceAll('_', ' ') as DottedName | ''

  // Restore currentQuestion from URL on page refresh
  useEffect(() => {
    if (!currentQuestion && questionFromUrl) {
      setCurrentQuestion(questionFromUrl)
    }
  }, [currentQuestion, questionFromUrl, setCurrentQuestion])
}
