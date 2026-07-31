'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import { useAuth } from '@/components/authentication/AuthProvider'
import { useSecondsLeft } from '@/components/authentication/_hooks/useSecondsLeft'
import ResendButton from './notReceived/ResendButton'

export default function NotReceived() {
  const { state } = useAuth()
  const secondsLeft = useSecondsLeft(
    state.phase === 'code_sent' ? state.cooldownUntil : 0
  )

  if (state.phase !== 'code_sent' && state.phase !== 'verifying_code') {
    return null
  }

  const hasResendError = state.phase === 'code_sent' && state.resendError !== null
  const isResending = state.phase === 'code_sent' ? state.isResending : false
  const isRetryDisabled = isResending || secondsLeft > 0

  return (
    <>
      <h3 className="mt-12 text-lg">
        <strong>
          <Trans i18nKey="signIn.verificationForm.notReceived.title">
            Vous n'avez pas reçu de code ?
          </Trans>
        </strong>
      </h3>

      <p className="mb-0">
        <Trans i18nKey="signIn.verificationForm.notReceived.text">
          Vérifiez vos spams ou outils anti-spam (MailinBlack, Altospam, etc...)
        </Trans>
      </p>

      {!hasResendError && (
        <ResendButton disabled={isRetryDisabled} secondsLeft={secondsLeft} />
      )}

      {hasResendError && (
        <div className="text-red-800 dark:text-white">
          <p>
            <Trans i18nKey="signIn.verificationForm.notReceived.error">
              Oups, une erreur s'est produite au moment de l'envoi de votre code...
            </Trans>
          </p>
          <div>
            <Button
              size="sm"
              className="dark:text-primary-900 dark:bg-primary-50 dark:hover:bg-primary-100 dark:hover:text-primary-900"
              onClick={() => window.location.reload()}>
              <Trans i18nKey="signIn.verificationForm.notReceived.reloadPage">
                Recharger la page
              </Trans>
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
