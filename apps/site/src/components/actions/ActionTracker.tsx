'use client'

import logger from '@/logger/logger.browser'
import type { FeatureFlagName } from '@/services/feature-flags/flags'
import { whenExperimentsResolved } from '@/utils/analytics/experimentExposure'
import { captureUniqueSessionActionEvent } from '@/utils/analytics/trackUniqueEvent'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import { useEffect } from 'react'

/**
 * Running experiments that use action events as a metric. Their exposure has to
 * be emitted before we capture, so the events land inside the experiment.
 */
const ACTION_EXPERIMENTS: FeatureFlagName[] = [
  'abc-test-layout-catalogue',
  'abc-test-action-card',
]

export default function ActionTracker({
  action,
  eventName,
}: {
  action: MaybePersonalizedAction
  eventName: 'consulted' | 'displayed'
}) {
  useEffect(() => {
    void whenExperimentsResolved(ACTION_EXPERIMENTS)
      .finally(() => {
        captureUniqueSessionActionEvent({
          eventName: `action ${eventName}`,
          actionTrackingId: action.trackingId,
          actionThemeTrackingId: action.theme.trackingId,
          co2PotentialInKg: action.assessment?.impact,
        })
      })
      .catch((error: unknown) =>
        logger.error(toError(error), { scope: 'site.interaction.actionTracker' })
      )
  }, [
    action.trackingId,
    action.theme.trackingId,
    action.assessment?.impact,
    eventName,
  ])

  return null
}
