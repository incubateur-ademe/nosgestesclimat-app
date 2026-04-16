'use client'

import type { AuthenticationMode } from '@/types/authentication'
import { useCallback, useState, type ReactNode } from 'react'

import { EMAIL_PENDING_AUTHENTICATION_KEY } from '@/constants/authentication/sessionStorage'
import {
  captureClickSubmitEmail,
  signinTrackEvent,
} from '@/constants/tracking/pages/signin'
import Button from '@/design-system/buttons/Button'
import useLogin from '@/hooks/authentication/useLogin'
import { usePendingVerification } from '@/hooks/authentication/usePendingVerification'
import { useUser } from '@/publicodes-state'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import type { UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { twMerge } from 'tailwind-merge'
import type { ButtonColor } from '../../design-system/buttons/Button'
import Trans from '../translation/trans/TransClient'
import SendVerificationCodeForm from './SendVerificationCodeForm'
import VerifyCodeForm from './VerifyCodeForm'

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
  verificationMutation?: UseMutationResult<
    { userId: string },
    Error,
    { email: string; code: string },
    unknown
  >
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
  verificationMutation,
  verificationClassName,
}: Props) {
  const router = useRouter()
  const { user } = useUser()

  const [isRedirecting, setIsRedirecting] = useState(false)

  // Called upon code verification
  const complete = useCallback(
    async (user: { email: string; userId: string }) => {
      safeSessionStorage.removeItem(EMAIL_PENDING_AUTHENTICATION_KEY)
      setIsRedirecting(true)

      if (trackers) {
        trackMatomoEvent__deprecated(trackers.matomo)
        trackPosthogEvent(trackers.posthog)
      }
      await onComplete?.(user)

      if (redirectPathname) {
        router.push(redirectPathname)
      }
      router.refresh()
    },
    [redirectPathname, onComplete, router, trackers]
  )

  const {
    pendingVerification,
    registerVerification,
    resetVerification,
    completeVerification,
  } = usePendingVerification({
    onComplete: (data) => {
      void complete(data)
    },
  })

  const login = useLogin()

  if (pendingVerification || isRedirecting) {
    return (
      <div
        className={twMerge(
          'dark:bg-primary-700 mb-8 rounded-xl bg-[#F4F5FB] p-4 md:p-8 dark:text-white',
          verificationClassName
        )}>
        <VerifyCodeForm
          onRegisterNewVerification={registerVerification}
          email={pendingVerification?.email ?? user.email ?? ''}
          onVerificationCompleted={completeVerification}
          verificationMutation={verificationMutation ?? login}
        />
        <Button
          onClick={resetVerification}
          color="link"
          className="dark:text-primary-50 dark:hover:text-primary-100 mt-2 -ml-2 flex items-center font-normal">
          <Trans i18nKey="signIn.verificationForm.notReceived.backButton">
            Retour à la connexion
          </Trans>
        </Button>
      </div>
    )
  }
  return (
    <SendVerificationCodeForm
      buttonLabel={buttonLabel}
      additionnalButton={additionnalButton}
      buttonColor={buttonColor}
      mode={mode}
      onCodeSent={(pendingVerification) => {
        registerVerification(pendingVerification)
        trackMatomoEvent__deprecated(signinTrackEvent(mode))
        trackPosthogEvent(captureClickSubmitEmail({ mode }))
      }}
      inputLabel={inputLabel}
      required={required}
      isVerticalLayout={isVerticalLayout}
    />
  )
}
