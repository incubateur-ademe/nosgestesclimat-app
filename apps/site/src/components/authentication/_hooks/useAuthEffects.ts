'use client'

import { useEffect, useRef, type Dispatch } from 'react'

import { useCookieManagement } from '@/components/cookies/useCookieManagement'
import { EMAIL_PENDING_AUTHENTICATION_KEY } from '@/constants/authentication/sessionStorage'
import { reconcileUserOnAuth } from '@/helpers/user/reconcileOnAuth'
import { hasSessionCookie } from '@/services/auth/has-session-cookie'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { maskEmail, maskUserId } from '@nosgestesclimat/core/lib/pii'
import { addBreadcrumb, captureException, captureMessage } from '@sentry/nextjs'
import { useRouter } from 'next/navigation'

import { UnknownCodeError } from '../errors'
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

    void verify(verificationEmail, verificationCode)
      .then((result) => {
        if (cancelled) return
        if (result.success) {
          dispatch({ type: 'CODE_VALID', userId: result.data.userId })
        } else {
          const { code } = result.error
          dispatch({ type: 'CODE_INVALID', reason: result.error })
          // Records what the user actually saw: rejected codes (mistyped,
          // rate-limited) are breadcrumbs, only the silent "unknown" failures
          // raise a Sentry warning. Dispatch comes first so logging can never
          // delay or block the error feedback.
          addBreadcrumb({
            category: 'auth',
            message: 'Verification code rejected',
            level: 'warning',
            data: { code, email: maskEmail(verificationEmail) },
          })
          if (code === 'unknown') {
            captureMessage('Verification code rejected with an unknown error', {
              level: 'warning',
              extra: { email: maskEmail(verificationEmail) },
            })
          }
        }
      })
      .catch((error) => {
        captureException(error)
        dispatch({ type: 'CODE_INVALID', reason: new UnknownCodeError() })
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
  const hasSessionCookieChecked = useRef(false)

  const authenticatedUserId =
    state.phase === 'authenticated' ? state.userId : null
  const authenticatedEmail =
    state.phase === 'authenticated' ? state.email : null

  useEffect(() => {
    if (!authenticatedUserId || !authenticatedEmail) return
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
        await options.onComplete?.({
          email: authenticatedEmail,
          userId: authenticatedUserId,
        })

        // Best-effort diagnostic: must never block or delay the login redirect.
        // It runs before the redirect so it happens while this component is
        // still mounted (after router.push the navigation can unmount it), but
        // stays fire-and-forget with its own error capture: a failing server
        // action must never swallow the redirect (see commit b228e6e).
        if (!hasSessionCookieChecked.current) {
          hasSessionCookieChecked.current = true
          void hasSessionCookie()
            .then((hasCookie) => {
              if (!hasCookie) {
                // The user just logged in but the session cookie is not coming
                // back on the next request: typically a browser-side persistence
                // issue (partitioning, iframe, domain) that silently logs them out.
                captureMessage('Authenticated user has no session cookie', {
                  level: 'warning',
                  extra: {
                    email: maskEmail(authenticatedEmail),
                    userId: maskUserId(authenticatedUserId),
                  },
                })
              }
            })
            .catch((error) => captureException(error))
        }

        if (options.redirectPathname) {
          router.push(options.redirectPathname)
          router.refresh()
        }
      } catch (error) {
        captureException(error)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
