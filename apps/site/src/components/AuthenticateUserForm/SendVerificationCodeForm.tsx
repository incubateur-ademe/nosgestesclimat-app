'use client'

import DefaultSubmitErrorMessage from '@/components/error/DefaultSubmitErrorMessage'
import Trans from '@/components/translation/trans/TransClient'
import { EMAIL_PENDING_AUTHENTICATION_KEY } from '@/constants/authentication/sessionStorage'
import type { ButtonColor } from '@/design-system/buttons/Button'
import Form from '@/design-system/form/Form'
import EmailInput from '@/design-system/inputs/EmailInput'
import { useCreateVerificationCode } from '@/hooks/authentication/useCreateVerificationCode'
import type { PendingVerification } from '@/hooks/authentication/usePendingVerification'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useUser } from '@/publicodes-state'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { isEmailValid } from '@/utils/isEmailValid'
import { type ReactNode } from 'react'
import { useForm } from 'react-hook-form'

interface Props {
  buttonLabel?: string | ReactNode
  buttonColor?: ButtonColor
  onCodeSent: (pendingVerification: PendingVerification) => void
  inputLabel?: ReactNode | string
  required?: boolean
  isVerticalLayout?: boolean
  additionnalButton?: ReactNode
  disabled?: boolean
}

interface FormData {
  email: string
}

export default function SendVerificationCodeForm({
  buttonLabel,
  buttonColor,
  inputLabel,
  onCodeSent,
  additionnalButton,
  required = true,
  isVerticalLayout = true,
  disabled,
}: Props) {
  const { t } = useClientTranslation()
  const {
    createVerificationCodeError,
    createVerificationCode,
    createVerificationCodePending,
  } = useCreateVerificationCode({
    onComplete: onCodeSent,
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
      isVerticalLayout={isVerticalLayout}
      loading={createVerificationCodePending}
      disabled={disabled}>
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

      {createVerificationCodeError && (
        <DefaultSubmitErrorMessage className="mt-4 max-w-120" />
      )}
    </Form>
  )
}
