import Trans from '@/components/translation/trans/TransClient'
import { clickConfirmUserAccountDeletionButton } from '@/constants/tracking/trackers'
import { resetLocalUserStateAndIdentity } from '@/helpers/user/reset-local-user-state-and-identity'
import browserLogger from '@/logger/logger.browser'
import { useUser } from '@/publicodes-state'
import { deleteUserAccount } from '@/services/users/delete-user-account'
import { trackEvent } from '@/utils/analytics/trackEvent'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import { useTransition } from 'react'
import { toast } from 'sonner'

const logger = browserLogger.child({
  scope: 'site.interaction.deleteAccount',
})

export function useDeleteUserAccount() {
  const [isPending, startTransition] = useTransition()
  const { setUser, setSimulation } = useUser()

  function handleDeleteUserAccount() {
    trackEvent(clickConfirmUserAccountDeletionButton)

    startTransition(async () => {
      try {
        await deleteUserAccount()
        resetLocalUserStateAndIdentity({ setUser, setSimulation })
      } catch (error) {
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
          return
        }
        logger.warn(toError(error))
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
