import { useClientTranslation } from '@/hooks/useClientTranslation'
import { commitToAction } from '@/services/actions/commit-to-action'
import { captureUniqueSessionActionEvent } from '@/utils/analytics/trackUniqueEvent'
import type { PersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { useTransition } from 'react'
import { toast } from 'sonner'

const TOAST_DISPLAY_DURATION = 5_000

import { abandonActionCommitment } from '@/services/actions/abandon-action-commitment'
import { useTriggerShineAnimation } from './useTriggerShineAnimation'
export function useCommitActionCommitment(action: PersonalizedAction) {
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
          ),
          {
            duration: TOAST_DISPLAY_DURATION,
          }
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

  const handleAbandonCommitment = () => {
    startTransition(async () => {
      try {
        await abandonActionCommitment({
          actionId: action.id,
          actionSlug: action.slug,
        })

        captureUniqueSessionActionEvent({
          actionThemeTrackingId: action.theme.trackingId,
          actionTrackingId: action.trackingId,
          co2PotentialInKg: action.assessment?.impact,
          eventName: 'action abandonned',
        })
        toast.success(
          t(
            'actions.abandonActionCommitment.success',
            'Action retirée avec succès.'
          ),
          {
            duration: TOAST_DISPLAY_DURATION,
          }
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
    abandonActionCommitment: handleAbandonCommitment,
    isPending,
    shouldDisplayAnimation,
  }
}
