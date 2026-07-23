'use client'

import { useCallback, type Dispatch } from 'react'

import { EMAIL_PENDING_AUTHENTICATION_KEY } from '@/constants/authentication/sessionStorage'
import { useLocale } from '@/hooks/useLocale'
import { createVerificationCode } from '@/services/auth/create-verification-code'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { formatEmail } from '@/utils/format/formatEmail'
import { useMutation } from '@tanstack/react-query'

import { mapEmailError } from '../errors'
import type { AuthEvent } from '../types'

const COOLDOWN_MS = 30000

function cooldownDeadline(): number {
  return Date.now() + COOLDOWN_MS
}

interface UseAuthCodeCreationOptions {
  dispatch: Dispatch<AuthEvent>
}

export function useAuthCodeCreation({ dispatch }: UseAuthCodeCreationOptions) {
  const locale = useLocale()
  const { mutateAsync: postVerificationCode, isPending } = useMutation({
    mutationFn: ({ email }: { email: string }) =>
      createVerificationCode({ email, locale }),
  })

  const sendEmail = useCallback(
    async (email: string) => {
      email = formatEmail(email)
      dispatch({ type: 'SUBMIT_EMAIL', email })
      try {
        const { expirationDate } = await postVerificationCode({ email })
        safeSessionStorage.setItem(EMAIL_PENDING_AUTHENTICATION_KEY, email)
        dispatch({
          type: 'EMAIL_SENT',
          pending: { email, expirationDate: new Date(expirationDate) },
          cooldownUntil: cooldownDeadline(),
        })
      } catch (error) {
        dispatch({
          type: 'EMAIL_ERROR',
          reason: mapEmailError(error),
          cooldownUntil: cooldownDeadline(),
        })
      }
    },
    [postVerificationCode, dispatch]
  )

  const resendCode = useCallback(
    async (email: string) => {
      dispatch({ type: 'RESEND_CODE' })
      try {
        const { expirationDate } = await postVerificationCode({ email })
        safeSessionStorage.setItem(EMAIL_PENDING_AUTHENTICATION_KEY, email)
        dispatch({
          type: 'CODE_RESENT',
          pending: { email, expirationDate: new Date(expirationDate) },
          cooldownUntil: cooldownDeadline(),
        })
      } catch (error) {
        const reason = mapEmailError(error)
        dispatch({
          type: 'CODE_RESEND_ERROR',
          reason,
          cooldownUntil:
            reason._tag === 'rate_limited' ? cooldownDeadline() : undefined,
        })
      }
    },
    [postVerificationCode, dispatch]
  )

  return {
    sendEmail,
    resendCode,
    isCreatingCode: isPending,
  }
}
