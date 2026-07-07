'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, type Dispatch } from 'react'

import { usePendingVerification } from '@/components/authentication/authenticateUserForm/_hooks/usePendingVerification'
import { EMAIL_PENDING_AUTHENTICATION_KEY } from '@/constants/authentication/sessionStorage'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'

import type { AuthEvent } from '../authMachine'

interface UseAuthCompletionOptions {
  dispatch: Dispatch<AuthEvent>
  onComplete?: (user: { email: string; userId: string }) => void | Promise<void>
  redirectPathname?: string
  trackers?: {
    matomo?: string[]
    posthog: {
      eventName: string
      properties?: Record<string, string | number | boolean | null | undefined>
    }
  }
}

/**
 * Sets up the post-authentication finalization flow:
 *  - clear session storage
 *  - dispatch FINALIZE
 *  - call onComplete
 *  - redirect
 *
 * Also restores a pendingVerification on mount (e.g. after page reload).
 */
export function useAuthCompletion({
  dispatch,
  onComplete,
  redirectPathname,
  trackers,
}: UseAuthCompletionOptions) {
  const router = useRouter()

  // Called after a successful code verification
  const handleComplete = useCallback(
    async (user: { email: string; userId: string }) => {
      safeSessionStorage.removeItem(EMAIL_PENDING_AUTHENTICATION_KEY)

      if (trackers) {
        trackPosthogEvent(trackers.posthog)
      }

      dispatch({ type: 'FINALIZE' })

      await onComplete?.(user)

      if (redirectPathname) {
        router.push(redirectPathname)
      }
      router.refresh()
    },
    [onComplete, redirectPathname, router, trackers, dispatch]
  )

  const { pendingVerification, completeVerification, registerVerification } =
    usePendingVerification({
      onComplete: handleComplete,
    })

  // Restore a pending verification once on mount
  const hasRestored = useRef(false)
  useEffect(() => {
    if (pendingVerification && !hasRestored.current) {
      hasRestored.current = true
      dispatch({ type: 'EMAIL_SENT', pendingVerification })
    }
  }, [pendingVerification, dispatch])

  return { completeVerification, registerVerification }
}
