import { trackEvent } from '@/utils/analytics/trackEvent'
import { useEffect } from 'react'
import { useGetTrackedPathname } from './useGetTrackedUrl'

export function useTrackPageview() {
  const trackedUrl = process.env.NEXT_PUBLIC_SITE_URL + useGetTrackedPathname()
  useEffect(() => {
    trackEvent({
      eventName: '$pageview',
      properties: {
        $current_url: trackedUrl,
      },
    })
  }, [trackedUrl])
}
