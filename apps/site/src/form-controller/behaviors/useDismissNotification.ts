'use client'

import { useFormWriteService } from '@/form-controller/write-service/useFormWriteService'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useCallback } from 'react'

/**
 * Dismiss a notification: the rule is set to `false` and nothing is folded — a
 * notification is not a question. The only write that is not an answer, so it
 * gets its own window instead of a general-purpose one.
 */
export function useDismissNotification() {
  const { setValue } = useFormWriteService()

  return useCallback(
    (notification: DottedName) => setValue(notification, false),
    [setValue]
  )
}
