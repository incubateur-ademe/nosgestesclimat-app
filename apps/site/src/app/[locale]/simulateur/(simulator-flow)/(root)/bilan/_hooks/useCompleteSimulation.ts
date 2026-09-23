import { useCurrentSimulation } from '@/publicodes-state'
import { getComputedResults } from '@/publicodes-state/helpers/getComputedResults'
import { EngineContext } from '@/publicodes-state/providers/engineProvider/context'
import { completeSimulation as completeSimulationAction } from '@/services/simulations/complete-simulation'
import type { CompleteSimulationPayload } from '@/services/simulations/complete-simulation-payload.schema'
import { useContext, useTransition } from 'react'

export function useCompleteSimulation() {
  const currentSimulation = useCurrentSimulation()
  const [isPending, startTransition] = useTransition()
  const engineContext = useContext(EngineContext)

  return {
    isPending,
    completeSimulation() {
      startTransition(async () => {
        const { id, progression, situation, foldedSteps } = currentSimulation
        await completeSimulationAction({
          id,
          progression,
          situation: situation as CompleteSimulationPayload['situation'],
          foldedSteps,
          computedResults: getComputedResults(engineContext),
        })
      })
    },
  }
}
