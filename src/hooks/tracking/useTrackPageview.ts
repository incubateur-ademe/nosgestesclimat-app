import posthog from 'posthog-js'
import { useEffect } from 'react'
import { useGetTrackedUrl } from './useGetTrackedUrl'

export function useTrackPageview() {
  const trackedUrl = useGetTrackedUrl()
  useEffect(() => {
    posthog.capture('$pageview', { $current_url: trackedUrl })
  }, [trackedUrl])
}
