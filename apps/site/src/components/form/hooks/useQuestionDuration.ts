import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useEffect, useRef } from 'react'

export function useQuestionDuration(question: DottedName) {
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    startTimeRef.current = Date.now()
  }, [question])

  return {
    getQuestionDuration: () => {
      return Date.now() - startTimeRef.current
    },
  }
}
