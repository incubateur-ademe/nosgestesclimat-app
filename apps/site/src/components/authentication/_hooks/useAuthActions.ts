'use client'

import { useCallback, type Dispatch } from 'react'
import type { AuthEvent } from '../types'

export function useAuthActions(dispatch: Dispatch<AuthEvent>) {
  const submitCode = useCallback(
    (code: string) => dispatch({ type: 'SUBMIT_CODE', code }),
    [dispatch]
  )
  const goBack = useCallback(() => dispatch({ type: 'GO_BACK' }), [dispatch])
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [dispatch])
  const clearCodeError = useCallback(
    () => dispatch({ type: 'CLEAR_CODE_ERROR' }),
    [dispatch]
  )

  return { submitCode, goBack, reset, clearCodeError }
}
