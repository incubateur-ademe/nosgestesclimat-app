'use client'

import { captureActionConsulted } from '@/constants/tracking/posthogTrackers'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import { useEffect } from 'react'

export default function ActionConsultedTracker({
  actionTrackingId,
  actionThemeTrackingId,
  co2PotentialInKg,
}: {
  actionTrackingId: string
  actionThemeTrackingId: string
  co2PotentialInKg?: number
}) {
  useEffect(() => {
    trackPosthogEvent(
      captureActionConsulted({
        actionTrackingId,
        actionThemeTrackingId,
        co2PotentialInKg,
      })
    )
  }, [actionTrackingId, actionThemeTrackingId, co2PotentialInKg])

  return null
}
