'use client'

import { capturePersonalizedActionListViewed } from '@/constants/tracking/posthogTrackers'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import type { PersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { useEffect } from 'react'

export default function ActionsPageTracker({
  actions,
  topActions,
}: {
  actions: PersonalizedAction[]
  topActions?: PersonalizedAction[]
}) {
  useEffect(() => {
    const themeCounts = actions.reduce(
      (acc, action) => {
        acc[action.theme.trackingId] ??= 0
        acc[action.theme.trackingId] += 1
        return acc
      },
      {} as Record<string, number>
    )
    trackPosthogEvent(
      capturePersonalizedActionListViewed({
        actionCountByThemeTrackingId: themeCounts,
        topActionTrackingIds: topActions
          ? topActions.map((a) => a.trackingId)
          : [],
      })
    )
  }, [actions, topActions])

  return null
}
