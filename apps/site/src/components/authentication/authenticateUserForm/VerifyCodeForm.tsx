'use client'

import { useAuth } from '@/components/authentication/AuthProvider'
import Trans from '@/components/translation/trans/TransClient'
import NotReceived from './verifyCodeForm/NotReceived'
import VerificationCodeForm from './verifyCodeForm/VerificationCodeForm'

interface Props {
  verificationButtonLabel?: string | React.ReactNode
}

export default function VerifyCode({ verificationButtonLabel }: Props) {
  const { state } = useAuth()

  if (state.phase === 'idle' || state.phase === 'email_sending') {
    return null
  }

  return (
    <div>
      <h2 className="flex items-center gap-2">
        <Trans>Vérifiez vos e-mails</Trans>
      </h2>

      <p>
        <Trans i18nKey="signIn.verificationForm.email.verificationCode.prefix">
          Entrez le
        </Trans>{' '}
        <strong className="text-primary-700 dark:text-primary-50">
          <Trans i18nKey="signIn.verificationForm.email.verificationCode.strong">
            code de vérification
          </Trans>
        </strong>{' '}
        <Trans i18nKey="signIn.verificationForm.email.verificationCode.suffix">
          envoyé à{' '}
        </Trans>
        <span>{state.email}</span>.
      </p>

      <VerificationCodeForm verificationButtonLabel={verificationButtonLabel} />

      {state.phase !== 'authenticated' && <NotReceived />}
    </div>
  )
}
