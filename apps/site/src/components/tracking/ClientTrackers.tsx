'use client'

import type { Region } from '@/helpers/server/model/models'
import { useTrackPageview } from '@/hooks/tracking/useTrackPageview'
import type { Locale } from '@/i18nConfig'
import posthog from 'posthog-js'
import { useEffect } from 'react'

export function ClientTrackers({
  locale,
  region,
}: {
  locale: Locale
  region: Region | undefined
}) {
  useEffect(() => {
    posthog.register_for_session({
      locale,
    })
  }, [locale])

  useEffect(() => {
    if (!region) return

    posthog.register_for_session({
      region,
    })
  }, [region])

  useTrackPageview()
  return null
}
