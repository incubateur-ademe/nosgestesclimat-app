'use client'

import { EMAIL_PENDING_AUTHENTICATION_KEY } from '@/constants/authentication/sessionStorage'
import { InvalidInputError } from '@/helpers/server/error'
import { createVerificationCode } from '@/services/auth/create-verification-code'
import type { AuthenticationMode } from '@/types/authentication'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { formatEmail } from '@/utils/format/formatEmail'
import { useMutation } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useLocale } from '../useLocale'
import { type PendingVerification } from './usePendingVerification'

export const enum CREATE_VERIFICATION_CODE_ERROR {
  UNKNOWN_ERROR = 'An unknown error occurred',
}

export function useCreateVerificationCode({
  onComplete,
}: {
  onComplete?: (pendingVerification: PendingVerification) => void
} = {}) {
  const locale = useLocale()
  const {
    mutateAsync: postVerificationCode,
    error,
    isPending,
  } = useMutation({
    mutationFn: ({ email }: { email: string; mode?: AuthenticationMode }) =>
      createVerificationCode({ email, mode, locale }),
  })

  const errorCode: CREATE_VERIFICATION_CODE_ERROR | false =
    !!error &&
    ((error instanceof InvalidInputError &&
      (error.errorObject as CREATE_VERIFICATION_CODE_ERROR)) ||
      CREATE_VERIFICATION_CODE_ERROR.UNKNOWN_ERROR)

  const createVerificationCodeFn = useCallback(
    async (email: string) => {
      try {
        email = formatEmail(email)

        const { expirationDate } = await postVerificationCode({
          email,
        })

        safeSessionStorage.setItem(EMAIL_PENDING_AUTHENTICATION_KEY, email)
        onComplete?.({ email, expirationDate: new Date(expirationDate) })
      } catch (error) {
        const errorMessage =
          error instanceof InvalidInputError && error.errorObject
        if (
          errorMessage ===
            CREATE_VERIFICATION_CODE_ERROR.SIGNIN_USER_DOES_NOT_EXIST ||
          errorMessage ===
            CREATE_VERIFICATION_CODE_ERROR.SIGNUP_USER_ALREADY_EXISTS
        ) {
          safeSessionStorage.setItem(EMAIL_PENDING_AUTHENTICATION_KEY, email)
        }
        return
      }
    },
    [onComplete, postVerificationCode]
  )

  return {
    createVerificationCode: createVerificationCodeFn,
    createVerificationCodeError: errorCode,
    createVerificationCodePending: isPending,
  }
}
