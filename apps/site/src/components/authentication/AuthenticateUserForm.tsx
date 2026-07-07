'use client'

import Button from '@/design-system/buttons/Button'
import type { AuthenticationMode } from '@/types/authentication'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import type { ButtonColor } from '../../design-system/buttons/Button'
import Trans from '../translation/trans/TransClient'
import {
  AuthProvider,
  useAuthContext,
} from './authenticateUserForm/AuthContext'
import SendVerificationCodeForm from './authenticateUserForm/SendVerificationCodeForm'
import VerifyCodeForm from './authenticateUserForm/VerifyCodeForm'

interface Props {
  buttonLabel?: string | ReactNode
  buttonColor?: ButtonColor
  inputLabel?: ReactNode | string
  mode?: AuthenticationMode
  redirectPathname?: string
  onEmailEntered?: (email: string) => void
  additionnalButton?: ReactNode
  onEmailEmpty?: () => void
  onComplete?: (user: { email: string; userId: string }) => void | Promise<void>
  required?: boolean
  trackers?: {
    matomo: string[]
    posthog: {
      eventName: string
      properties?: Record<string, string | number | boolean | null | undefined>
    }
  }
  isVerticalLayout?: boolean
  onCompleteError?: string
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
  trackers,
  isVerticalLayout = true,
  verificationClassName,
}: Props) {
  return (
    <AuthProvider
      mode={mode}
      redirectPathname={redirectPathname}
      onComplete={onComplete}
      trackers={trackers}>
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
  const { state, goBack } = useAuthContext() ?? {}

  // Switch on phase so TypeScript narrows the discriminated union
  switch (state?.phase) {
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
    default: {
      // All remaining phases carry an `email` field
      const { email } = state ?? {}
      return (
        <div
          className={twMerge(
            'dark:bg-primary-700 mb-8 rounded-xl bg-[#F4F5FB] p-4 md:p-8 dark:text-white',
            verificationClassName
          )}>
          <VerifyCodeForm email={email ?? ''} />

          <Button
            onClick={goBack}
            color="link"
            className="dark:text-primary-50 dark:hover:text-primary-100 mt-2 -ml-2 flex items-center font-normal">
            <Trans i18nKey="signIn.verificationForm.notReceived.backButton">
              Retour à la connexion
            </Trans>
          </Button>
        </div>
      )
    }
  }
}
