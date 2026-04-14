import { trackingRegion } from '@/constants/tracking/misc'
import { useUser } from '@/publicodes-state'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import posthog from 'posthog-js'
import { useEffect } from 'react'

export function useTrackRegion() {
  const { user } = useUser()

  const { region } = user

  useEffect(() => {
    const regionCode = region?.code || 'FR'
    trackMatomoEvent__deprecated(trackingRegion(regionCode))
    posthog.register_for_session({
      region,
    })
  }, [region])
}
