'use client'

import Button from '@/design-system/buttons/Button'
import type { AuthenticationMode } from '@/types/authentication'
import { type ReactNode, useCallback } from 'react'
import { twMerge } from 'tailwind-merge'
import type { ButtonColor } from '../../design-system/buttons/Button'
import Trans from '../translation/trans/TransClient'
import SendVerificationCodeForm from './authenticateUserForm/SendVerificationCodeForm'
import VerifyCodeForm from './authenticateUserForm/VerifyCodeForm'
import { useLogin } from './_hooks/useLogin'
import { AuthProvider, useAuth } from './AuthProvider'
import type { AuthenticatedUser, Tracker } from './types'

interface Props {
  buttonLabel?: string | ReactNode
  buttonColor?: ButtonColor
  inputLabel?: ReactNode | string
  mode?: AuthenticationMode
  redirectPathname?: string
  additionnalButton?: ReactNode
  onComplete?: (user: AuthenticatedUser) => void | Promise<void>
  required?: boolean
  tracker?: Tracker
  isVerticalLayout?: boolean
  verificationClassName?: string
}

export default function AuthenticateUserForm({
  buttonLabel,
  buttonColor = 'primary',
  additionnalButton,
  inputLabel,
  redirectPathname,
  mode,
  onComplete,
  required = true,
  tracker,
  isVerticalLayout = true,
  verificationClassName,
}: Props) {
  const { mutateAsync } = useLogin()

  const verify = useCallback(
    (email: string, code: string) => mutateAsync({ email, code }),
    [mutateAsync]
  )

  return (
    <AuthProvider
      verify={verify}
      mode={mode}
      redirectPathname={redirectPathname}
      onComplete={onComplete}
      tracker={tracker}>
      <AuthenticateUserFormContent
        buttonLabel={buttonLabel}
        buttonColor={buttonColor}
        additionnalButton={additionnalButton}
        inputLabel={inputLabel}
        required={required}
        isVerticalLayout={isVerticalLayout}
        verificationClassName={verificationClassName}
      />
    </AuthProvider>
  )
}

function AuthenticateUserFormContent({
  buttonLabel,
  buttonColor,
  additionnalButton,
  inputLabel,
  required,
  isVerticalLayout,
  verificationClassName,
}: {
  buttonLabel?: string | ReactNode
  buttonColor?: ButtonColor
  additionnalButton?: ReactNode
  inputLabel?: ReactNode | string
  required?: boolean
  isVerticalLayout?: boolean
  verificationClassName?: string
}) {
  const { state, goBack } = useAuth()

  switch (state.phase) {
    case 'idle':
    case 'email_sending':
      return (
        <SendVerificationCodeForm
          buttonLabel={buttonLabel}
          additionnalButton={additionnalButton}
          buttonColor={buttonColor}
          inputLabel={inputLabel}
          required={required}
          isVerticalLayout={isVerticalLayout}
        />
      )
    case 'code_sent':
    case 'verifying_code':
    case 'authenticated':
      return (
        <div
          className={twMerge(
            'dark:bg-primary-700 mb-8 rounded-xl bg-[#F4F5FB] p-4 md:p-8 dark:text-white',
            verificationClassName
          )}>
          <VerifyCodeForm />

          {state.phase !== 'authenticated' && (
            <Button
              onClick={goBack}
              color="link"
              className="dark:text-primary-50 dark:hover:text-primary-100 mt-2 -ml-2 flex items-center font-normal">
              <Trans i18nKey="signIn.verificationForm.notReceived.backButton">
                Retour à la connexion
              </Trans>
            </Button>
          )}
        </div>
      )
    default:
      return null
  }
}
