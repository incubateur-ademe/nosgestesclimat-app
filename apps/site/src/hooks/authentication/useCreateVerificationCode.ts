import { EMAIL_PENDING_AUTHENTICATION_KEY } from '@/constants/authentication/sessionStorage'
import { VERIFICATION_CODE_URL } from '@/constants/urls/main'
import type { AuthenticationMode } from '@/types/authentication'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { formatEmail } from '@/utils/format/formatEmail'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
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
    mutationFn: ({
      email,
    }: {
      email: string

      mode?: AuthenticationMode
    }) =>
      axios
        .post(
          VERIFICATION_CODE_URL,
          {
            email,
          },
          {
            params: { locale },
          }
        )
        .then((response) => response.data),
  })

  const errorCode: CREATE_VERIFICATION_CODE_ERROR | false =
    !!error &&
    ((error instanceof AxiosError &&
      (error.response?.data as CREATE_VERIFICATION_CODE_ERROR)) ||
      CREATE_VERIFICATION_CODE_ERROR.UNKNOWN_ERROR)

  const createVerificationCode = useCallback(
    async (email: string) => {
      try {
        email = formatEmail(email)

        const { expirationDate } = await postVerificationCode({
          email,
        })

        safeSessionStorage.setItem(EMAIL_PENDING_AUTHENTICATION_KEY, email)
        onComplete?.({ email, expirationDate })
      } catch {
        // Error is handled by the useCreateVerificationCode hook
        return
      }
    },
    [onComplete, postVerificationCode]
  )

  return {
    createVerificationCode,
    createVerificationCodeError: errorCode,
    createVerificationCodePending: isPending,
  }
}
