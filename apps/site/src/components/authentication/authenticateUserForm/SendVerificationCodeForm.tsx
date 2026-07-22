'use client'

import DefaultSubmitErrorMessage from '@/components/error/DefaultSubmitErrorMessage'
import Trans from '@/components/translation/trans/TransClient'
import { EMAIL_PENDING_AUTHENTICATION_KEY } from '@/constants/authentication/sessionStorage'
import { captureClickSubmitEmail } from '@/constants/tracking/pages/signin'
import type { ButtonColor } from '@/design-system/buttons/Button'
import Form from '@/design-system/form/Form'
import EmailInput from '@/design-system/inputs/EmailInput'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useUser } from '@/publicodes-state'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { isEmailValid } from '@/utils/isEmailValid'
import { type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../AuthProvider'

interface Props {
  buttonLabel?: string | ReactNode
  buttonColor?: ButtonColor
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
  inputLabel,
  additionnalButton,
  required = true,
  isVerticalLayout = true,
}: Props) {
  const { t } = useClientTranslation()

  const { sendEmail, state, isCreatingCode, mode } = useAuth()

  const user = useUser().user

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<FormData>({
    defaultValues: {
      email:
        safeSessionStorage.getItem(EMAIL_PENDING_AUTHENTICATION_KEY) ??
        (user && 'email' in user ? user.email : ''),
    },
  })

  const isLoading = isCreatingCode || state.phase === 'email_sending'

  return (
    <Form
      onSubmit={(e) => {
        trackPosthogEvent(captureClickSubmitEmail({ mode }))
        void handleSubmit((data: FormData) => {
          void sendEmail(data.email)
        })(e)
      }}
      buttonLabel={
        buttonLabel ?? t('signIn.emailForm.buttonLabel', 'Accéder à mon espace')
      }
      buttonColor={buttonColor}
      additionnalButton={additionnalButton}
      isVerticalLayout={isVerticalLayout}
      loading={isLoading}>
      <EmailInput
        data-testid="verification-code-email-input"
        containerClassName={isVerticalLayout ? 'w-full' : 'max-w-full w-96'}
        label={
          inputLabel ?? (
            <Trans i18nKey="signIn.emailForm.inputLabel">
              Votre adresse e-mail
            </Trans>
          )
        }
        {...register('email', {
          required: required
            ? t(
                'signIn.emailForm.error.required',
                'Merci de renseigner votre adresse e-mail'
              )
            : undefined,
          validate: (value) => {
            if (!isEmailValid(value)) {
              return t(
                'signIn.emailForm.error.invalid',
                "L'adresse e-mail est invalide"
              )
            }

            return true
          },
        })}
        error={formErrors.email?.message}
      />

      {state.phase === 'idle' && state.emailError === 'rate_limited' && (
        <p className="mt-4 text-sm text-red-800 dark:text-white" role="alert">
          <Trans i18nKey="signIn.emailForm.error.rateLimited">
            Un code vient d'être envoyé à cette adresse. Veuillez patienter avant
            d'en demander un nouveau.
          </Trans>
        </p>
      )}

      {state.phase === 'idle' && state.emailError === 'unknown' && (
        <DefaultSubmitErrorMessage className="mt-4 max-w-120" />
      )}
    </Form>
  )
}
