'use client'

import { captureActionConsulted } from '@/constants/tracking/posthogTrackers'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import type { PersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { useEffect } from 'react'

export default function ActionConsultedTracker({
  action,
}: {
  action: PersonalizedAction
}) {
  useEffect(() => {
    trackPosthogEvent(
      captureActionConsulted({
        actionTrackingId: action.trackingId,
        actionThemeTrackingId: action.theme.trackingId,
        co2PotentialInKg: action.assessment?.impact,
      })
    )
  }, [action.trackingId, action.theme.trackingId, action.assessment?.impact])

  return null
}
