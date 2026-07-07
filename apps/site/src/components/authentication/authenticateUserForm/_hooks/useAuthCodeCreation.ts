'use client'

import { useCallback, useEffect, type Dispatch } from 'react'

import { useCreateVerificationCode } from '@/components/authentication/authenticateUserForm/_hooks/useCreateVerificationCode'

import type { AuthEvent } from '../authMachine'

interface UseAuthCodeCreationOptions {
  dispatch: Dispatch<AuthEvent>
  /** Current machine phase — needed to dispatch the correct error event */
  phase: string
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
  phase,
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

  // When the code-creation mutation fails, tell the machine which error
  useEffect(() => {
    if (!createVerificationCodeError) return

    if (phase === 'email_sending') {
      dispatch({ type: 'EMAIL_ERROR' })
    } else if (phase === 'resending_code') {
      dispatch({ type: 'CODE_RESEND_ERROR' })
    }
  }, [createVerificationCodeError, phase, dispatch])

  const sendEmail = useCallback(
    async (email: string) => {
      dispatch({ type: 'SUBMIT_EMAIL', email })
      await createVerificationCode(email)
    },
    [createVerificationCode, dispatch]
  )

  const resendCode = useCallback(
    async (email: string) => {
      dispatch({ type: 'RESEND_CODE' })
      await createVerificationCode(email)
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
