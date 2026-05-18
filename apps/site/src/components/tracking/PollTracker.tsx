'use client'

import type { BaseOrganisationPoll } from '@/types/organisations'
import posthog from 'posthog-js'
import { useEffect } from 'react'

export function PollTracker({ poll }: { poll: BaseOrganisationPoll }) {
  useEffect(() => {
    posthog.register_for_session({
      organisation: poll.organisation.slug,
      poll: poll.slug,
    })
    posthog.register({
      current_simulation_mode: poll.mode,
    })
  }, [poll])
  return null
}
