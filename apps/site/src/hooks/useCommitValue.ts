'use client'

import { useCommitting } from '@/contexts/CommitingContext'
import { requestIdleCallback } from '@/utils/requestIdleCallback'
import { useCallback } from 'react'

export function useCommitValue(setValue: (value: string | undefined) => void) {
  const { setIsCommitting } = useCommitting()

  return useCallback(
    (newValue: string | undefined) => {
      setIsCommitting(true)
      requestIdleCallback(() => {
        setValue(newValue)
        setIsCommitting(false)
      })
    },
    [setValue, setIsCommitting]
  )
}
