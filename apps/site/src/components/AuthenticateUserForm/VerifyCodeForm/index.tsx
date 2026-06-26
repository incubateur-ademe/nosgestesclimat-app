import { useCreateVerificationCode } from '@/hooks/authentication/useCreateVerificationCode'
import { type PendingVerification } from '@/hooks/authentication/usePendingVerification'
import useTimeLeft from '@/hooks/organisations/useTimeleft'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { UseMutationResult } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import type { TFunction } from 'i18next'
import { useCallback } from 'react'
import NotReceived from './NotReceived'
import VerificationContent from './VerificationContent'

interface Props {
  email: string
  onRegisterNewVerification: (newVerification: PendingVerification) => void
  onVerificationCompleted: (serverUserId: string) => void | Promise<void>
  verificationMutation: UseMutationResult<
    { userId: string },
    Error,
    { email: string; code: string },
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

export default function VerificationForm({
  email,
  onVerificationCompleted,
  onRegisterNewVerification,
  verificationMutation,
}: Props) {
  const { timeLeft, setTimeLeft } = useTimeLeft(NUM_SECONDS)

  const { t } = useClientTranslation()

  const {
    createVerificationCode,
    // @TODO : handle error when asking for a new verification code
    createVerificationCodePending,
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

  const handleValidateVerificationCode = useCallback(
    async (code: string) => {
      if (isValidationDisabled) {
        return
      }
      const payload = {
        email,
        code,
      }

      const { userId } = await mutateAsync(payload)

      await onVerificationCompleted(userId)
    },
    [isValidationDisabled, mutateAsync, email, onVerificationCompleted]
  )
  return (
    <div>
      <VerificationContent
        email={email}
        inputError={(error && getErrorMessage({ error, t })) ?? undefined}
        isSuccessValidate={isSuccess}
        isPendingValidate={isPending}
        handleValidateVerificationCode={handleValidateVerificationCode}
      />

      {!isSuccess && (
        <NotReceived
          isRetryButtonDisabled={isRetryButtonDisabled}
          isErrorResend={!!error}
          onResendVerificationCode={() => {
            void createVerificationCode(email)
          }}
          timeLeft={timeLeft}
        />
      )}
    </div>
  )
}
