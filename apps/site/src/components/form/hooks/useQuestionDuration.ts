import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useEffect, useState } from 'react'

export function useQuestionDuration(question: DottedName) {
  const [startTime, setStartTime] = useState(() => Date.now())

  useEffect(() => {
    setStartTime(Date.now())
  }, [question])

  return {
    getQuestionDuration: () => {
      return Date.now() - startTime
    },
  }
}
