import { useCookieManagement } from '@/components/cookies/useCookieManagement'
import { reconcileUserOnAuth } from '@/helpers/user/reconcileOnAuth'
import { useUser } from '@/publicodes-state'
import { captureException } from '@sentry/nextjs'
import dayjs from 'dayjs'
import { useCallback } from 'react'

export interface PendingVerification {
  expirationDate: Date
  email: string
}

export function usePendingVerification({
  onComplete,
}: {
  onComplete?: (user: { email: string; userId: string }) => void | Promise<void>
}) {
  const user = useUser()

  const { cookieState } = useCookieManagement()

  let pendingVerification = user.user.pendingVerification

  if (
    pendingVerification &&
    dayjs(pendingVerification.expirationDate).isBefore(dayjs())
  ) {
    pendingVerification = undefined
  }

  const handleVerificationCompleted = useCallback(
    async (userId: string) => {
      if (!pendingVerification) {
        return
      }

      try {
        await reconcileUserOnAuth({
          userId,
          email: pendingVerification.email,
          user,
          cookieState,
        })

        user.updatePendingVerification(undefined)
        await onComplete?.({ email: pendingVerification.email, userId })
      } catch (error) {
        captureException(error)
      }
    },
    [onComplete, pendingVerification, user, cookieState]
  )

  return {
    pendingVerification,
    resetVerification: () => user.updatePendingVerification(undefined),
    registerVerification: (verification: PendingVerification) =>
      user.updatePendingVerification(verification),
    completeVerification: handleVerificationCompleted,
  } as const
}
