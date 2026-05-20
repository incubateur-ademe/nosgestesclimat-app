import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useCallback, useEffect, useRef } from 'react'

export function useQuestionTimeSpent(question: DottedName) {
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    startTimeRef.current = Date.now()
  }, [question])

  const calledBackGetQuestionTimeSpent = useCallback(() => {
    return Date.now() - startTimeRef.current
  }, [])

  return {
    getQuestionTimeSpent: calledBackGetQuestionTimeSpent,
  }
}
