'use client'

import useTimeLeft from '@/hooks/organisations/useTimeleft'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { AxiosError } from 'axios'
import type { TFunction } from 'i18next'
import { useCallback } from 'react'
import { useAuthContext } from './AuthContext'
import NotReceived from './verifyCodeForm/NotReceived'
import VerificationContent from './verifyCodeForm/VerificationContent'

interface Props {
  email: string
}

enum ERROR_MESSAGES {
  INVALID_CODE = 'Forbidden ! Invalid verification code.',
}

const NUM_SECONDS = 30

const getErrorMessage = ({ error, t }: { error: Error; t: TFunction }) => {
  const errorMessage =
    error instanceof AxiosError
      ? (error.response?.data as { message?: string }).message
      : error.message

  if (errorMessage === ERROR_MESSAGES.INVALID_CODE) {
    return t('signIn.code.invalid', 'Le code est invalide')
  }
  return t(
    'common.errors.errorHappened',
    'Une erreur est survenue. Veuillez réessayer.'
  )
}

export default function VerificationForm({ email }: Props) {
  const { timeLeft: resendTimeLeft, setTimeLeft: setResendTimeLeft } =
    useTimeLeft(NUM_SECONDS)

  const { t } = useClientTranslation()

  const {
    state,
    verifyCode,
    resendCode,
    loginError,
    hasResendError,
    clearLoginError,
  } = useAuthContext()

  const isPending = state.phase === 'verifying_code'
  const isSuccess =
    state.phase === 'authenticated' || state.phase === 'redirecting'
  const isResending = state.phase === 'resending_code'

  const isValidationDisabled = isPending || isSuccess || isResending

  const isRetryButtonDisabled = isValidationDisabled || resendTimeLeft > 0

  const inputError =
    loginError && state.phase === 'code_sent'
      ? getErrorMessage({ error: loginError, t })
      : undefined

  const handleValidateVerificationCode = useCallback(
    async (code: string) => {
      if (isValidationDisabled) return
      await verifyCode(code, email)
    },
    [isValidationDisabled, verifyCode, email]
  )

  const handleInputChange = useCallback(
    (code: string) => {
      if (code.length < 6) {
        clearLoginError()
      }
    },
    [clearLoginError]
  )

  const handleResend = useCallback(() => {
    setResendTimeLeft(NUM_SECONDS)
    void resendCode(email)
  }, [resendCode, setResendTimeLeft, email])

  return (
    <div>
      <VerificationContent
        email={email}
        inputError={inputError}
        isSuccessValidate={isSuccess}
        isPendingValidate={isPending}
        handleValidateVerificationCode={handleValidateVerificationCode}
        isInputDisabled={isValidationDisabled}
        onInputChange={handleInputChange}
      />

      {!isSuccess && (
        <NotReceived
          isRetryButtonDisabled={isRetryButtonDisabled}
          isErrorResend={hasResendError ?? false}
          onResendVerificationCode={handleResend}
          timeLeft={resendTimeLeft}
        />
      )}
    </div>
  )
}
