'use client'

import { setUserTimeZoneCookie } from '@/helpers/date/userTimeZone'
import { useEffect } from 'react'

// Stores the visitor's IANA timezone in a cookie so server components can
// render dates in the user's timezone. The cookie is written once, on the
// client; the first request falls back to FALLBACK_TIME_ZONE.
export default function UserTimeZoneSetter() {
  useEffect(() => {
    setUserTimeZoneCookie()
  }, [])

  return null
}
