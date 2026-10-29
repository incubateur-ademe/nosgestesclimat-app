import Trans from '@/components/translation/trans/TransClient'
import { clickConfirmUserAccountDeletionButton } from '@/constants/tracking/trackers'
import { logoutAndResetUserState } from '@/helpers/user/logout-and-reset-user-state'
import { useUser } from '@/publicodes-state'
import { deleteUserAccount } from '@/services/users/delete-user-account'
import { trackEvent } from '@/utils/analytics/trackEvent'
import { useTransition } from 'react'
import { toast } from 'sonner'

export function useDeleteUserAccount() {
  const [isPending, startTransition] = useTransition()
  const { setUser, setSimulation } = useUser()

  function handleDeleteUserAccount() {
    trackEvent(clickConfirmUserAccountDeletionButton)
    startTransition(async () => {
      try {
        await deleteUserAccount()
        await logoutAndResetUserState({
          setUser,
          setSimulation,
        })
      } catch {
        toast.error(
          <Trans i18nKey="errors.generic_error">
            Une erreur s'est produite, veuillez réessayer.
          </Trans>
        )
      }
    })
  }
  return {
    deleteUserAccount: handleDeleteUserAccount,
    isPending,
  }
}
