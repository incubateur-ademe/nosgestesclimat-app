'use client'

import DefaultSubmitErrorMessage from '@/components/error/DefaultSubmitErrorMessage'
import Trans from '@/components/translation/trans/TransClient'
import { EMAIL_PENDING_AUTHENTICATION_KEY } from '@/constants/authentication/sessionStorage'
import Alert from '@/design-system/alerts/alert/Alert'
import type { ButtonColor } from '@/design-system/buttons/Button'
import Form from '@/design-system/form/Form'
import EmailInput from '@/design-system/inputs/EmailInput'
import {
  CREATE_VERIFICATION_CODE_ERROR,
  useCreateVerificationCode,
} from '@/hooks/authentication/useCreateVerificationCode'
import type { PendingVerification } from '@/hooks/authentication/usePendingVerification'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useUser } from '@/publicodes-state'
import type { AuthenticationMode } from '@/types/authentication'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { isEmailValid } from '@/utils/isEmailValid'
import { type ReactNode } from 'react'
import { useForm } from 'react-hook-form'

interface Props {
  buttonLabel?: string | ReactNode
  buttonColor?: ButtonColor
  mode?: AuthenticationMode
  onCodeSent: (pendingVerification: PendingVerification) => void
  inputLabel?: ReactNode | string
  required?: boolean
  isVerticalLayout?: boolean
  additionnalButton?: ReactNode
}

interface FormData {
  email: string
}

export default function SendVerificationCodeForm({
  buttonLabel,
  buttonColor,
  mode,
  inputLabel,
  onCodeSent,
  additionnalButton,
  required = true,
  isVerticalLayout = true,
}: Props) {
  const { t } = useClientTranslation()
  const { createVerificationCodeError, createVerificationCode } =
    useCreateVerificationCode({
      onComplete: onCodeSent,
      mode,
    })

  const user = useUser().user

  const defaultEmail =
    safeSessionStorage.getItem(EMAIL_PENDING_AUTHENTICATION_KEY) ?? user.email

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<FormData>({
    defaultValues: {
      email: defaultEmail,
    },
  })

  return (
    <Form
      onSubmit={handleSubmit((data) => createVerificationCode(data.email))}
      buttonLabel={buttonLabel ?? t('Accéder à mon espace')}
      buttonColor={buttonColor}
      additionnalButton={additionnalButton}
      isVerticalLayout={isVerticalLayout}>
      <EmailInput
        data-testid="verification-code-email-input"
        containerClassName={isVerticalLayout ? 'w-full' : 'max-w-full w-96'}
        label={inputLabel ?? <Trans>Votre adresse e-mail</Trans>}
        {...register('email', {
          required: required
            ? t('Merci de renseigner votre adresse e-mail')
            : undefined,
          validate: (value) => {
            if (!isEmailValid(value)) {
              return t("L'adresse e-mail est invalide")
            }

            return true
          },
        })}
        error={formErrors.email?.message}
      />

      {createVerificationCodeError ===
      false ? null : createVerificationCodeError ===
        CREATE_VERIFICATION_CODE_ERROR.SIGNIN_USER_DOES_NOT_EXIST ? (
        <Alert
          type="error"
          className="mt-4 max-w-[30rem]"
          description={
            <Trans i18nKey="signIn.email.error.userDoesNotExist">
              Nous n’avons pas d’e-mail enregistré à cette adresse. Veuillez
              vous inscrire pour accéder à votre espace.
            </Trans>
          }
        />
      ) : createVerificationCodeError ===
        CREATE_VERIFICATION_CODE_ERROR.SIGNUP_USER_ALREADY_EXISTS ? (
        <Alert
          type="error"
          className="mt-4 max-w-[30rem]"
          description={
            <Trans i18nKey="signIn.email.error.userAlreadyExists">
              Vous avez déjà un compte avec cet e-mail. Merci de vous connecter
              directement.
            </Trans>
          }
        />
      ) : (
        <DefaultSubmitErrorMessage className="mt-4 max-w-[30rem]" />
      )}
    </Form>
  )
}
