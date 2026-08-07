'use client'

import type { SimulationMode } from '@/helpers/server/model/simulations'
import { replaceCompletedSimulationsForPoll } from '@/services/simulations/replace-completed-simulations-for-poll'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ReplaceSimulationForPoll({
  mode,
}: {
  mode: SimulationMode
}) {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        // Idempotent: simulations already replaced are simply not returned
        // anymore, so re-running (e.g. in React StrictMode) is harmless.
        await replaceCompletedSimulationsForPoll(mode)
      } catch {
        // If the replacement fails the youth tutorial still shows; the user
        // will start a fresh test anyway.
      } finally {
        // Re-render the server component so it no longer sees the replaced
        // simulation (e.g. to show the youth tutorial instead of a reuse card).
        if (!cancelled) router.refresh()
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [mode, router])

  return null
}
