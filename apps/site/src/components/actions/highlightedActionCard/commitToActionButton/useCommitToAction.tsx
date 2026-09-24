import { captureActionAddedToPlan } from '@/constants/tracking/trackers'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { commitToAction } from '@/services/actions/commit-to-action'
import type { PersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

const ANIMATION_DURATION = 1300

export function useCommitToAction(action: PersonalizedAction) {
  const { t } = useClientTranslation()

  const [isPending, startTransition] = useTransition()
  const [shouldDisplayAnimation, setShouldDisplayAnimation] = useState(false)
  const handleCommitToAction = () => {
    setShouldDisplayAnimation(true)

    startTransition(async () => {
      const result = await commitToAction(action.id)

      if (!result.success) {
        toast.error(
          t(
            'actions.commitToActionButton.error',
            "Une erreur s'est produite, veuillez réessayer."
          )
        )
      }

      captureActionAddedToPlan({
        actionTitle: action.title,
        actionTheme: action.theme,
        impactInKg: action.assessment?.impact,
      })

      toast.success(
        t(
          'actions.commitToActionButton.success',
          'Action sélectionnée avec succès.'
        )
      )
    })
  }

  useEffect(() => {
    let timeoutBeforeDisablingAnimation = undefined
    if (shouldDisplayAnimation) {
      timeoutBeforeDisablingAnimation = setTimeout(() => {
        setShouldDisplayAnimation(false)
      }, ANIMATION_DURATION)
    }

    return () => clearTimeout(timeoutBeforeDisablingAnimation)
  }, [shouldDisplayAnimation])

  return {
    commitToAction: handleCommitToAction,
    isPending,
    shouldDisplayAnimation,
  }
}
