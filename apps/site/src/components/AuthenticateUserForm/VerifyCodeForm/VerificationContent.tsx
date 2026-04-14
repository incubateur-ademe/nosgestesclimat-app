'use client'

import VerificationCodeInput from '@/components/organisations/VerificationCodeInput'
import Trans from '@/components/translation/trans/TransClient'

interface Props {
  email: string
  inputError: string | undefined
  isSuccessValidate: boolean
  isPendingValidate: boolean
  handleValidateVerificationCode: (verificationCode: string) => Promise<void>
}

export default function VerificationContent({
  email,
  inputError,
  isSuccessValidate,
  isPendingValidate,
  handleValidateVerificationCode,
}: Props) {
  return (
    <>
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
        <span>{email}</span>.
      </p>

      <form>
        <label htmlFor="code" className="mb-4 block font-bold">
          <Trans>Entrez votre code de vérification pour continuer</Trans>
        </label>

        <VerificationCodeInput
          inputError={inputError}
          isSuccessValidate={isSuccessValidate}
          isPendingValidate={isPendingValidate}
          handleValidateVerificationCode={handleValidateVerificationCode}
        />
      </form>
    </>
  )
}
