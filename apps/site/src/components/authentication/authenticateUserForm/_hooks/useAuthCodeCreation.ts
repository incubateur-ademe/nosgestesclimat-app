'use client'

import { useCallback, type Dispatch } from 'react'

import { useCreateVerificationCode } from '@/components/authentication/authenticateUserForm/_hooks/useCreateVerificationCode'

import type { AuthEvent } from '../authMachine'

interface UseAuthCodeCreationOptions {
  dispatch: Dispatch<AuthEvent>
  /** Called when a verification code is successfully created */
  onRegisterVerification: (verification: {
    expirationDate: Date
    email: string
  }) => void
}

/**
 * Manages the creation & re-sending of verification codes.
 */
export function useAuthCodeCreation({
  dispatch,
  onRegisterVerification,
}: UseAuthCodeCreationOptions) {
  const {
    createVerificationCode,
    createVerificationCodeError,
    createVerificationCodePending,
    resetVerificationCode,
  } = useCreateVerificationCode({
    onCompleteAction: (newPending) => {
      onRegisterVerification(newPending)
      dispatch({ type: 'EMAIL_SENT', pendingVerification: newPending })
    },
  })

  const sendEmail = useCallback(
    async (email: string) => {
      dispatch({ type: 'SUBMIT_EMAIL', email })
      try {
        await createVerificationCode(email)
      } catch {
        dispatch({ type: 'EMAIL_ERROR' })
      }
    },
    [createVerificationCode, dispatch]
  )

  const resendCode = useCallback(
    async (email: string) => {
      dispatch({ type: 'RESEND_CODE' })
      try {
        await createVerificationCode(email)
      } catch {
        dispatch({ type: 'CODE_RESEND_ERROR' })
      }
    },
    [createVerificationCode, dispatch]
  )

  return {
    sendEmail,
    resendCode,
    isCreatingCode: createVerificationCodePending,
    /** Raw error from the create-verification-code mutation */
    createVerificationCodeError,
    /** Reset the mutation state (error, loading) */
    resetCodeCreation: resetVerificationCode,
  }
}
