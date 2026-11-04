'use client'

import { useLogout } from '@/components/authentication/_hooks/useLogout'
import Trans from '@/components/translation/trans/TransClient'
import { accountDeletionCompleted } from '@/constants/tracking/trackers'
import { eraseUserAccount } from '@/services/users/erase-user-account'
import { trackEvent } from '@/utils/analytics/trackEvent'
import { useTransition } from 'react'
import { toast } from 'sonner'

const TOAST_DISPLAY_DURATION = 5_000

export function useEraseUserAccount() {
  const [isPending, startTransition] = useTransition()
  const logout = useLogout()

  function handleEraseUserAccount() {
    startTransition(async () => {
      await eraseUserAccount()

      // Captured before `resetIdentity`: afterwards the event loses the account.
      trackEvent(accountDeletionCompleted)

      // Before the logout: its redirect navigates away, and the toast outlives
      // the layout the two pages share.
      toast.success(
        <Trans i18nKey="mon-espace.settings.delete.success">
          Votre espace personnel a bien été supprimé
        </Trans>,
        { duration: TOAST_DISPLAY_DURATION }
      )

      await logout()
    })
  }

  return { eraseUserAccount: handleEraseUserAccount, isPending }
}
