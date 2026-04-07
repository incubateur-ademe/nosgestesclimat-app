'use client'

import LockIcon from '@/components/icons/LockIcon'
import CheckCircleIcon from '@/components/icons/status/CheckCircleIcon'
import Trans from '@/components/translation/trans/TransClient'
import {
  captureClickResendCode,
  clickResendCode,
} from '@/constants/tracking/pages/signin'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import { useState } from 'react'

interface Props {
  isRetryButtonDisabled: boolean
  onResendVerificationCode: () => void | Promise<void>
  timeLeft: number
}

export default function ResendButton({
  isRetryButtonDisabled,
  onResendVerificationCode,
  timeLeft,
}: Props) {
  const [shouldDisplayConfirmation, setShouldDisplayConfirmation] =
    useState(false)

  const { t } = useClientTranslation()

  async function handleResendVerificationCode() {
    if (isRetryButtonDisabled) {
      return
    }

    trackMatomoEvent__deprecated(clickResendCode)
    trackPosthogEvent(captureClickResendCode())

    await onResendVerificationCode()
    setShouldDisplayConfirmation(true)

    setTimeout(() => {
      setShouldDisplayConfirmation(false)
    }, 4000)
  }

  return (
    <div className="flex items-center">
      <Button
        color="link"
        aria-disabled={isRetryButtonDisabled}
        aria-label={
          isRetryButtonDisabled
            ? t('Renvoyer le code, désactivé pendant 30 secondes')
            : ''
        }
        className="dark:text-primary-50 dark:hover:text-primary-50 -ml-2 font-normal"
        onClick={() => {
          void handleResendVerificationCode()
        }}>
        {isRetryButtonDisabled && timeLeft > 0 && (
          <span className="mr-2 flex items-center">
            <LockIcon className="fill-primary-700 dark:fill-primary-50 mr-2 h-4 w-4" />
            <Trans i18nKey="signIn.verificationForm.notReceived.resendButton">
              Renvoyer le code
            </Trans>
          </span>
        )}

        {shouldDisplayConfirmation && (
          <span className="flex items-center text-green-500 no-underline dark:text-green-100">
            <CheckCircleIcon className="mr-2 h-4 w-4 fill-green-500" />
            <Trans i18nKey="signIn.verificationForm.notReceived.resendButton.confirmation">
              Code renvoyé
            </Trans>
          </span>
        )}

        {!shouldDisplayConfirmation && !isRetryButtonDisabled && (
          <span className="flex items-center underline">
            <Trans i18nKey="signIn.verificationForm.notReceived.resendButton">
              Renvoyer le code
            </Trans>
          </span>
        )}
      </Button>
      {isRetryButtonDisabled && timeLeft > 0 && (
        <span className="text-xs font-normal text-slate-500 no-underline! dark:text-slate-100">
          {t(
            'signIn.verificationForm.notReceived.resendButton.timeLeft',
            'Attendre {{timeLeft}} secondes',
            { timeLeft }
          )}
        </span>
      )}
    </div>
  )
}
