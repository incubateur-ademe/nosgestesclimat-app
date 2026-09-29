import { captureActionAddedToPlan } from '@/constants/tracking/trackers'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { commitToAction } from '@/services/actions/commit-to-action'
import { trackEvent } from '@/utils/analytics/trackEvent'
import type { PersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import type { ActionChoiceType } from '@nosgestesclimat/core/prisma/generated/enums'
import { useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

const ANIMATION_DURATION = 1300

export function useCommitToAction(
  action: PersonalizedAction,
  cacheTagToUpdate: string
) {
  const { t } = useClientTranslation()

  const [isPending, startTransition] = useTransition()
  const handleCommitToAction = () => {
    startTransition(async () => {
      const result = await commitToAction(action.id, cacheTagToUpdate)

      if (!result.success) {
        toast.error(
          t(
            'actions.commitToActionButton.error',
            "Une erreur s'est produite, veuillez réessayer."
          )
        )
      }

      trackEvent(
        captureActionAddedToPlan({
          actionTitle: action.title,
          actionTheme: action.theme.trackingId,
          impactInKg: action.assessment?.impact,
        })
      )

      toast.success(
        t(
          'actions.commitToActionButton.success',
          'Action sélectionnée avec succès.'
        )
      )
    })
  }

  const shouldDisplayAnimation = useTriggerShineAnimation(action.choice?.type)

  return {
    commitToAction: handleCommitToAction,
    isPending,
    shouldDisplayAnimation,
  }
}

function useTriggerShineAnimation(type?: ActionChoiceType) {
  const [shouldDisplayAnimation, setShouldDisplayAnimation] = useState(false)
  const wasCommitted = useRef(type === 'committed')
  useEffect(() => {
    const isCommitted = type === 'committed'
    if (isCommitted && !wasCommitted.current) setShouldDisplayAnimation(true)
    wasCommitted.current = isCommitted
  }, [type])

  useEffect(() => {
    let timeoutBeforeDisablingAnimation = undefined
    if (shouldDisplayAnimation) {
      timeoutBeforeDisablingAnimation = setTimeout(() => {
        setShouldDisplayAnimation(false)
      }, ANIMATION_DURATION)
    }

    return () => clearTimeout(timeoutBeforeDisablingAnimation)
  }, [shouldDisplayAnimation])

  return type ? shouldDisplayAnimation : false
}
