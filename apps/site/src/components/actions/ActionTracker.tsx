'use client'

import { captureAction } from '@/constants/tracking/posthogTrackers'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { useEffect } from 'react'

export default function ActionTracker({
  action,
  eventName,
}: {
  action: MaybePersonalizedAction
  eventName: 'consulted' | 'displayed'
}) {
  useEffect(() => {
    captureAction({
      eventName: `action ${eventName}`,
      actionTrackingId: action.trackingId,
      actionThemeTrackingId: action.theme.trackingId,
      co2PotentialInKg: action.assessment?.impact,
    })
  }, [
    action.trackingId,
    action.theme.trackingId,
    action.assessment?.impact,
    eventName,
  ])

  return null
}
