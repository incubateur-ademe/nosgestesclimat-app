'use client'

import { useCurrentSimulation, useEngine } from '@/publicodes-state'
import { completeSimulation as completeSimulationAction } from '@/services/simulations/complete-simulation'
import type { CompleteSimulationPayload } from '@/services/simulations/complete-simulation-payload.schema'
import { getComputedResults } from '@nosgestesclimat/core/features/simulations/helpers/get-computed-results'
import { useTransition } from 'react'

/**
 * Complete the simulation (the form's End step): a server action that persists
 * the final situation and redirects to the results. Always background — the
 * pending state drives the submit button's loading kind, never a blocking save.
 */
export function useCompleteSimulation() {
  const currentSimulation = useCurrentSimulation()
  const [isPending, startTransition] = useTransition()
  const { engine } = useEngine()

  const completeSimulation = () => {
    startTransition(async () => {
      const { id, model, progression, situation, foldedSteps } =
        currentSimulation
      await completeSimulationAction({
        id,
        model,
        progression,
        situation: situation as CompleteSimulationPayload['situation'],
        foldedSteps,
        computedResults: getComputedResults(engine),
      })
    })
  }

  return { isPending, completeSimulation }
}
