'use client'

import { EMAIL_PENDING_AUTHENTICATION_KEY } from '@/constants/authentication/sessionStorage'
import { useLocale } from '@/hooks/useLocale'
import { createVerificationCode } from '@/services/auth/create-verification-code'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { formatEmail } from '@/utils/format/formatEmail'
import { useMutation } from '@tanstack/react-query'
import { useCallback } from 'react'
import { type PendingVerification } from './usePendingVerification'

export const enum CREATE_VERIFICATION_CODE_ERROR {
  UNKNOWN_ERROR = 'An unknown error occurred',
}

export function useCreateVerificationCode({
  onCompleteAction,
}: {
  onCompleteAction?: (pendingVerification: PendingVerification) => void
} = {}) {
  const locale = useLocale()
  const {
    mutateAsync: postVerificationCode,
    error,
    isPending,
    reset,
  } = useMutation({
    mutationFn: ({ email }: { email: string }) =>
      createVerificationCode({ email, locale }),
  })

  const errorCode: CREATE_VERIFICATION_CODE_ERROR | false =
    !!error && CREATE_VERIFICATION_CODE_ERROR.UNKNOWN_ERROR

  const createVerificationCodeFn = useCallback(
    async (email: string) => {
      try {
        email = formatEmail(email)
        const { expirationDate } = await postVerificationCode({
          email,
        })

        safeSessionStorage.setItem(EMAIL_PENDING_AUTHENTICATION_KEY, email)
        onCompleteAction?.({ email, expirationDate: new Date(expirationDate) })
      } catch {
        return
      }
    },
    [onCompleteAction, postVerificationCode]
  )

  return {
    createVerificationCode: createVerificationCodeFn,
    createVerificationCodeError: errorCode,
    createVerificationCodePending: isPending,
    resetVerificationCode: reset,
  }
}
