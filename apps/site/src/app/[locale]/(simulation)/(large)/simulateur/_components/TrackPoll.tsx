'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'

export function TrackPoll({
  organisation,
  poll,
}: {
  organisation: string
  poll: string
}) {
  useEffect(() => {
    posthog.register_for_session({ organisation, poll })
  }, [organisation, poll])
  return null
}
