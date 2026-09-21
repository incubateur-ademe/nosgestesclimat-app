'use client'

import type { Region } from '@/helpers/server/model/models'
import { useTrackPageview } from '@/hooks/tracking/useTrackPageview'
import type { Locale } from '@/i18nConfig'
import { registerSessionProperties } from '@/services/tracking/posthogSessionProperties'
import { useEffect } from 'react'

export function ClientTrackers({
  locale,
  region,
}: {
  locale: Locale
  region: Region | undefined
}) {
  useEffect(() => {
    registerSessionProperties({
      locale,
    })
  }, [locale])

  useEffect(() => {
    if (!region) return
    registerSessionProperties({
      region,
    })
  }, [region])

  useTrackPageview()
  return null
}
