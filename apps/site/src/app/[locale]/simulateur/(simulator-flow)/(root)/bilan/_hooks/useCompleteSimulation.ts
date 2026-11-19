import { useCurrentSimulation, useEngine } from '@/publicodes-state'
import { completeSimulation as completeSimulationAction } from '@/services/simulations/complete-simulation'
import type { CompleteSimulationPayload } from '@/services/simulations/complete-simulation-payload.schema'
import { getComputedResults } from '@nosgestesclimat/core/features/simulations/helpers/get-computed-results'
import { useTransition } from 'react'

export function useCompleteSimulation() {
  const currentSimulation = useCurrentSimulation()
  const [isPending, startTransition] = useTransition()
  const { engine } = useEngine()

  return {
    isPending,
    completeSimulation() {
      startTransition(async () => {
        const { id, model, progression, status, situation, foldedSteps } =
          currentSimulation
        // An incomplete simulation is not filtered out here on purpose: the
        // server answers with a `simulation_incomplete` failure, which no side
        // reports.
        await completeSimulationAction({
          id,
          model,
          progression,
          status,
          situation: situation as CompleteSimulationPayload['situation'],
          foldedSteps,
          computedResults: getComputedResults(engine),
        })
      })
    },
  }
}
