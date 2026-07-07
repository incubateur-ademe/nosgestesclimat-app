'use client'

import { useCallback, type Dispatch } from 'react'

import { useLogin } from '@/components/authentication/authenticateUserForm/_hooks/useLogin'

import type { AuthEvent } from '../authMachine'

interface UseAuthLoginOptions {
  dispatch: Dispatch<AuthEvent>
  /** Called after a successful login — carries out post-auth side effects */
  completeVerification: (userId: string) => Promise<void>
  /** Reset the create-verification-code mutation state */
  resetCodeCreation: () => void
}

/**
 * Manages the code-verification (login) mutation.
 */
export function useAuthLogin({
  dispatch,
  completeVerification,
  resetCodeCreation,
}: UseAuthLoginOptions) {
  const login = useLogin()

  const verifyCode = useCallback(
    async (code: string, email: string) => {
      dispatch({ type: 'SUBMIT_CODE', code })

      try {
        const { userId } = await login.mutateAsync({ email, code })
        dispatch({ type: 'CODE_VALID', userId })
        await completeVerification(userId)
      } catch {
        dispatch({ type: 'CODE_INVALID' })
      }
    },
    [login, completeVerification, dispatch]
  )

  const goBack = useCallback(() => {
    login.reset()
    resetCodeCreation()
    dispatch({ type: 'GO_BACK' })
  }, [login, resetCodeCreation, dispatch])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [dispatch])

  const clearLoginError = useCallback(() => {
    login.reset()
  }, [login])

  return {
    verifyCode,
    goBack,
    reset,
    clearLoginError,
    /** Raw login error — the UI translates it via getErrorMessage */
    loginError: login.error ?? null,
  }
}
