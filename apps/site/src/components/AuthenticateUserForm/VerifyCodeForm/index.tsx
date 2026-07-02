import { useCreateVerificationCode } from '@/hooks/authentication/useCreateVerificationCode'
import { type PendingVerification } from '@/hooks/authentication/usePendingVerification'
import useTimeLeft from '@/hooks/organisations/useTimeleft'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { UseMutationResult } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import type { TFunction } from 'i18next'
import { useCallback, useRef } from 'react'
import NotReceived from './NotReceived'
import VerificationContent from './VerificationContent'

interface Props<T extends object> {
  email: string
  onRegisterNewVerification: (newVerification: PendingVerification) => void
  onVerificationCompleted: (serverUserId: string) => void | Promise<void>
  mutationPayload?: T
  verificationMutation: UseMutationResult<
    { userId: string },
    Error,
    { email?: string; code?: string } & T,
    unknown
  >
  onCompleteError?: string
}

enum ERROR_MESSAGES {
  ACCOUNT_ALREADY_EXISTS = 'Different user ids found',
  INVALID_CODE = 'Forbidden ! Invalid verification code.',
}

const getErrorMessage = ({ error, t }: { error: Error; t: TFunction }) => {
  const errorMessage =
    error instanceof AxiosError
      ? (error.response?.data as { message?: string })?.message
      : error.message

  if (errorMessage === ERROR_MESSAGES.ACCOUNT_ALREADY_EXISTS) {
    return t('Un compte avec cette adresse e-mail existe déjà')
  } else if (errorMessage === ERROR_MESSAGES.INVALID_CODE) {
    return t('Le code est invalide')
  }
  return t('Une erreur est survenue. Veuillez réessayer.')
}

const NUM_SECONDS = 30

export default function VerificationForm<T extends object>({
  email,
  onVerificationCompleted,
  onRegisterNewVerification,
  mutationPayload: mutateProps,
  verificationMutation,
}: Props<T>) {
  const { timeLeft, setTimeLeft } = useTimeLeft(NUM_SECONDS)

  const { t } = useClientTranslation()

  const {
    createVerificationCode,
    createVerificationCodePending,
    createVerificationCodeError,
  } = useCreateVerificationCode({
    onComplete: (pendingVerification) => {
      onRegisterNewVerification(pendingVerification)
      setTimeLeft(NUM_SECONDS)
    },
  })
  const { isSuccess, isPending, error, mutateAsync } = verificationMutation

  const isValidationDisabled =
    isPending || isSuccess || createVerificationCodePending
  const isRetryButtonDisabled = isValidationDisabled || timeLeft > 0

  // Add check to make sure no double call can be made
  // which may cause the code to be invalidated
  const isMutationInProgress = useRef(false)

  const handleValidateVerificationCode = useCallback(
    async (code: string) => {
      if (isValidationDisabled || isMutationInProgress.current) {
        return
      }

      try {
        isMutationInProgress.current = true

        const payload = {
          email,
          code,
          ...((mutateProps ?? {}) as T),
        }

        const { userId } = await mutateAsync(payload)

        await onVerificationCompleted?.(userId)
      } finally {
        isMutationInProgress.current = false
      }
    },
    [
      isValidationDisabled,
      mutateAsync,
      email,
      mutateProps,
      onVerificationCompleted,
    ]
  )
  const handleCodeChange = useCallback(() => {
    verificationMutation.reset()
  }, [verificationMutation])
  return (
    <div>
      <VerificationContent
        email={email}
        inputError={(error && getErrorMessage({ error, t })) ?? undefined}
        isSuccessValidate={isSuccess}
        isPendingValidate={isPending}
        handleValidateVerificationCode={handleValidateVerificationCode}
        onCodeChange={handleCodeChange}
      />

      {!isSuccess && (
        <NotReceived
          isRetryButtonDisabled={isRetryButtonDisabled}
          isErrorResend={!!createVerificationCodeError}
          onResendVerificationCode={() => {
            void createVerificationCode(email)
          }}
          timeLeft={timeLeft}
        />
      )}
    </div>
  )
}
