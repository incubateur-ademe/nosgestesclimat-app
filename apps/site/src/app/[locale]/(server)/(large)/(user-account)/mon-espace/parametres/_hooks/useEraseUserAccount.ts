'use client'

import { useLogout } from '@/components/authentication/_hooks/useLogout'
import { accountDeletionCompleted } from '@/constants/tracking/trackers'
import { eraseUserAccount } from '@/services/users/erase-user-account'
import { trackEvent } from '@/utils/analytics/trackEvent'
import { useTransition } from 'react'

export function useEraseUserAccount() {
  const [isPending, startTransition] = useTransition()
  const logout = useLogout()

  function handleEraseUserAccount() {
    startTransition(async () => {
      await eraseUserAccount()

      // Captured before `resetIdentity`: afterwards the event loses the account.
      trackEvent(accountDeletionCompleted)

      await logout()
    })
  }

  return { eraseUserAccount: handleEraseUserAccount, isPending }
}
