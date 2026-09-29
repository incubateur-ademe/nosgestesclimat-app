import { useClientTranslation } from '@/hooks/useClientTranslation'
import { commitToAction } from '@/services/actions/commit-to-action'
import { captureUniqueSessionActionEvent } from '@/utils/analytics/trackUniqueEvent'
import type { PersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { useTriggerShineAnimation } from './useTriggerShineAnimation'
export function useCommitToAction(action: PersonalizedAction) {
  const { t } = useClientTranslation()

  const [isPending, startTransition] = useTransition()
  const handleCommitToAction = () => {
    startTransition(async () => {
      try {
        await commitToAction(action.id, action.slug)

        captureUniqueSessionActionEvent({
          actionThemeTrackingId: action.theme.trackingId,
          actionTrackingId: action.trackingId,
          co2PotentialInKg: action.assessment?.impact,
          eventName: 'action committed',
        })

        toast.success(
          t(
            'actions.commitToActionButton.success',
            'Action sélectionnée avec succès.'
          )
        )
      } catch {
        toast.error(
          t(
            'actions.commitToActionButton.error',
            "Une erreur s'est produite, veuillez réessayer."
          )
        )
      }
    })
  }

  const shouldDisplayAnimation = useTriggerShineAnimation(action.choice?.type)

  return {
    commitToAction: handleCommitToAction,
    isPending,
    shouldDisplayAnimation,
  }
}
