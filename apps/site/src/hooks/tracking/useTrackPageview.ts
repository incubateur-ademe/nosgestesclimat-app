import posthog from 'posthog-js'
import { useEffect } from 'react'
import { useGetTrackedPathname } from './useGetTrackedUrl'

export function useTrackPageview() {
  const trackedUrl = process.env.NEXT_PUBLIC_SITE_URL + useGetTrackedPathname()
  useEffect(() => {
    posthog.capture('$pageview', { $current_url: trackedUrl })
  }, [trackedUrl])
}
