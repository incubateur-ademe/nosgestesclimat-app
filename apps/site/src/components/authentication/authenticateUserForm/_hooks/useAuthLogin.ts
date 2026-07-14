'use client'

import { useCallback, useEffect, type Dispatch } from 'react'

import { useLogin } from '@/components/authentication/authenticateUserForm/_hooks/useLogin'

import type { AuthEvent, AuthPhase } from '../authMachine'

interface UseAuthLoginOptions {
  state: AuthPhase
  dispatch: Dispatch<AuthEvent>
  /** Called after a successful login — carries out post-auth side effects */
  completeVerification: (userId: string) => Promise<void>
  /** Reset the create-verification-code mutation state */
  resetCodeCreation: () => void
}

/**
 * Manages the code-verification (login) mutation.
 * The API call is triggered by a side effect when the state machine
 * enters the `verifying_code` phase — not directly from the UI handler.
 */
export function useAuthLogin({
  state,
  dispatch,
  completeVerification,
  resetCodeCreation,
}: UseAuthLoginOptions) {
  const {
    mutateAsync,
    reset: resetLoginMutation,
    error,
  } = useLogin()

  const verificationEmail =
    state.phase === 'verifying_code' ? state.pendingVerification.email : null

  const verificationCode =
    state.phase === 'verifying_code' ? state.code : null

  const authenticatedUserId =
    state.phase === 'authenticated' ? state.userId : null

  const verifyCode = useCallback(
    (code: string) => {
      dispatch({ type: 'SUBMIT_CODE', code })
    },
    [dispatch]
  )

  // Side effect: verify the code when entering `verifying_code`
  useEffect(() => {
    if (!verificationEmail || !verificationCode) {
      return
    }

    let cancelled = false

    void mutateAsync({ email: verificationEmail, code: verificationCode })
      .then(({ userId }) => {
        if (!cancelled) {
          dispatch({ type: 'CODE_VALID', userId })
        }
      })
      .catch(() => {
        if (!cancelled) {
          dispatch({ type: 'CODE_INVALID' })
        }
      })

    return () => {
      cancelled = true
    }
  }, [verificationEmail, verificationCode, mutateAsync, dispatch])

  // Side effect: finalize auth when entering `authenticated`
  useEffect(() => {
    if (!authenticatedUserId) {
      return
    }

    void completeVerification(authenticatedUserId)
  }, [authenticatedUserId, completeVerification])

  const goBack = useCallback(() => {
    resetLoginMutation()
    resetCodeCreation()
    dispatch({ type: 'GO_BACK' })
  }, [resetLoginMutation, resetCodeCreation, dispatch])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [dispatch])

  const clearLoginError = useCallback(() => {
    resetLoginMutation()
  }, [resetLoginMutation])

  return {
    verifyCode,
    goBack,
    reset,
    clearLoginError,
    /** Raw login error — the UI translates it via getErrorMessage */
    loginError: error ?? null,
  }
}
