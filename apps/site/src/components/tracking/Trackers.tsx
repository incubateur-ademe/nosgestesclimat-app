'use client'

import { useTrackLocale } from '@/hooks/tracking/useTrackLocale'
import { useTrackPageview } from '@/hooks/tracking/useTrackPageview'
import type { Locale } from '@/i18nConfig'

/**
 * This component is used to track page views and locale.
 */
export default function Trackers({ locale }: { locale: Locale }) {
  useTrackLocale({ locale })
  useTrackPageview()
  return null
}
