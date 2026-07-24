'use client'

import { useEffect, type Dispatch } from 'react'

import { useCookieManagement } from '@/components/cookies/useCookieManagement'
import { EMAIL_PENDING_AUTHENTICATION_KEY } from '@/constants/authentication/sessionStorage'
import { reconcileUserOnAuth } from '@/helpers/user/reconcileOnAuth'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { captureException } from '@sentry/nextjs'
import { useRouter } from 'next/navigation'

import type {
  AuthEvent,
  AuthPhase,
  AuthenticatedUser,
  Tracker,
  VerifyStrategy,
} from '../types'

function useVerifyEffect(
  state: AuthPhase,
  dispatch: Dispatch<AuthEvent>,
  verify: VerifyStrategy
) {
  const verificationEmail =
    state.phase === 'verifying_code' ? state.pending.email : null
  const verificationCode = state.phase === 'verifying_code' ? state.code : null

  useEffect(() => {
    if (!verificationEmail || !verificationCode) return

    let cancelled = false

    void verify(verificationEmail, verificationCode).then((result) => {
      if (cancelled) return
      if (result.success) {
        dispatch({ type: 'CODE_VALID', userId: result.output.userId })
      } else {
        dispatch({ type: 'CODE_INVALID', reason: result.error })
      }
    })

    return () => {
      cancelled = true
    }
  }, [verificationEmail, verificationCode, verify, dispatch])
}

function useCompletionEffect(
  state: AuthPhase,
  options: {
    onComplete?: (user: AuthenticatedUser) => void | Promise<void>
    redirectPathname?: string
    tracker?: Tracker
  }
) {
  const router = useRouter()
  const { cookieState } = useCookieManagement()

  const authenticatedUserId =
    state.phase === 'authenticated' ? state.userId : null
  const authenticatedEmail =
    state.phase === 'authenticated' ? state.email : null

  useEffect(() => {
    if (!authenticatedUserId || !authenticatedEmail) return

    let cancelled = false

    void (async () => {
      try {
        safeSessionStorage.removeItem(EMAIL_PENDING_AUTHENTICATION_KEY)

        if (options.tracker) {
          trackPosthogEvent(options.tracker)
        }

        await reconcileUserOnAuth({
          userId: authenticatedUserId,
          cookieState,
        })

        if (!cancelled) {
          await options.onComplete?.({
            email: authenticatedEmail,
            userId: authenticatedUserId,
          })

          if (options.redirectPathname) {
            router.push(options.redirectPathname)
            router.refresh()
          }
        }
      } catch (error) {
        captureException(error)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    authenticatedUserId,
    authenticatedEmail,
    options.tracker,
    cookieState,
    options.onComplete,
    options.redirectPathname,
    router,
  ])
}

interface UseAuthEffectsOptions {
  state: AuthPhase
  dispatch: Dispatch<AuthEvent>
  verify: VerifyStrategy
  onComplete?: (user: AuthenticatedUser) => void | Promise<void>
  redirectPathname?: string
  tracker?: Tracker
}

export function useAuthEffects({
  state,
  dispatch,
  verify,
  onComplete,
  redirectPathname,
  tracker,
}: UseAuthEffectsOptions) {
  useVerifyEffect(state, dispatch, verify)
  useCompletionEffect(state, { onComplete, redirectPathname, tracker })
}
