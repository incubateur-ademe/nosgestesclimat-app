'use client'

import LockIcon from '@/components/icons/LockIcon'
import CheckCircleIcon from '@/components/icons/status/CheckCircleIcon'
import Trans from '@/components/translation/trans/TransClient'
import { captureClickResendCode } from '@/constants/tracking/pages/signin'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import { useAuth } from '@/components/authentication/AuthProvider'
import { useState } from 'react'

interface Props {
  disabled: boolean
  secondsLeft: number
}

export default function ResendButton({ disabled, secondsLeft }: Props) {
  const { state, resendCode } = useAuth()
  const [shouldDisplayConfirmation, setShouldDisplayConfirmation] = useState(false)
  const { t } = useClientTranslation()

  async function handleResend() {
    if (disabled) return
    trackPosthogEvent(captureClickResendCode())
    await resendCode(state.phase === 'code_sent' ? state.email : '')
    setShouldDisplayConfirmation(true)
    setTimeout(() => setShouldDisplayConfirmation(false), 4000)
  }

  return (
    <div className="flex items-center">
      <Button
        color="link"
        aria-disabled={disabled}
        aria-label={disabled ? t('Renvoyer le code, désactivé pendant 30 secondes') : ''}
        className="dark:text-primary-50 dark:hover:text-primary-50 -ml-2 font-normal no-underline"
        onClick={() => { void handleResend() }}>
        {!shouldDisplayConfirmation && disabled && secondsLeft > 0 && (
          <span className="mr-2 flex cursor-not-allowed items-center underline">
            <LockIcon className="fill-primary-700 dark:fill-primary-50 mr-2 h-4 w-4" />
            <Trans i18nKey="signIn.verificationForm.notReceived.resendButton">Renvoyer le code</Trans>
          </span>
        )}

        {!shouldDisplayConfirmation && !disabled && (
          <span className="flex items-center underline">
            <Trans i18nKey="signIn.verificationForm.notReceived.resendButton">Renvoyer le code</Trans>
          </span>
        )}

        {shouldDisplayConfirmation && (
          <span className="flex cursor-default items-center text-green-500 no-underline dark:text-green-100">
            <CheckCircleIcon className="mr-2 h-4 w-4 fill-green-500" />
            <Trans i18nKey="signIn.verificationForm.notReceived.resendButton.confirmation">Code renvoyé</Trans>
          </span>
        )}
      </Button>
      {disabled && secondsLeft > 0 && (
        <span className="text-xs font-normal text-slate-500 no-underline! dark:text-slate-100">
          {t('signIn.verificationForm.notReceived.resendButton.timeLeft', 'Attendre {{timeLeft}} secondes', { timeLeft: secondsLeft })}
        </span>
      )}
    </div>
  )
}
