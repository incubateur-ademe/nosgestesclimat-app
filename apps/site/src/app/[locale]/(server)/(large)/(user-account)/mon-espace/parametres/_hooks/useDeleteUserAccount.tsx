import Trans from '@/components/translation/trans/TransClient'
import { clickConfirmUserAccountDeletionButton } from '@/constants/tracking/trackers'
import { deleteUserAccount } from '@/services/users/delete-user-account'
import { trackEvent } from '@/utils/analytics/trackEvent'
import { useTransition } from 'react'
import { toast } from 'sonner'

export function useDeleteUserAccount() {
  const [isPending, startTransition] = useTransition()

  function handleDeleteUserAccount() {
    trackEvent(clickConfirmUserAccountDeletionButton)
    try {
      startTransition(async () => {
        await deleteUserAccount()
      })
      toast.success(
        <Trans i18nKey="my_space.account_deletion">
          Votre compte a été supprimé avec succès.
        </Trans>
      )
    } catch {
      toast.error(
        <Trans i18nKey="errors.generic_error">
          Une erreur s'est produite, veuillez réessayer.
        </Trans>
      )
    }
  }
  return {
    deleteUserAccount: handleDeleteUserAccount,
    isPending,
  }
}
