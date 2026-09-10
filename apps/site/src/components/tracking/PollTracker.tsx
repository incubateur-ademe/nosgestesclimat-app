'use client'

import type { SimulationMode } from '@/helpers/server/model/simulations'
import posthog from 'posthog-js'
import { useEffect } from 'react'

interface TrackedPoll {
  slug: string
  mode: SimulationMode
  organisation: { slug: string }
}

export function PollTracker({ poll }: { poll: TrackedPoll }) {
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
