'use client'

import { trackingLocale, trackingRegion } from '@/constants/tracking/misc'
import type { UserRegion } from '@/helpers/server/model/models'
import { useTrackPageview } from '@/hooks/tracking/useTrackPageview'
import type { Locale } from '@/i18nConfig'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import posthog from 'posthog-js'
import { useEffect } from 'react'

export function ClientTrackers({
  locale,
  region,
}: {
  locale: Locale
  region: UserRegion | undefined
}) {
  useEffect(() => {
    trackMatomoEvent__deprecated(trackingLocale(locale))
    posthog.register_for_session({
      locale,
    })
  }, [locale])

  useEffect(() => {
    if (!region) return

    trackMatomoEvent__deprecated(trackingRegion(region))
    posthog.register_for_session({
      region,
    })
  }, [region])

  useTrackPageview()
  return null
}
