import { useCurrentSimulation } from '@/publicodes-state'
import { getComputedResults } from '@/publicodes-state/helpers/getComputedResults'
import { EngineContext } from '@/publicodes-state/providers/engineProvider/context'
import { completeSimulation as completeSimulationAction } from '@/services/simulations/complete-simulation'
import type { CompleteSimulationPayload } from '@/services/simulations/complete-simulation-payload.schema'
import { captureException, setExtra } from '@sentry/nextjs'
import { useContext, useTransition } from 'react'

export function useCompleteSimulation() {
  const currentSimulation = useCurrentSimulation()
  const [isPending, startTransition] = useTransition()
  const engineContext = useContext(EngineContext)

  return {
    isPending,
    completeSimulation() {
      const progression = currentSimulation.progression
      if (progression !== 1) return

      startTransition(async () => {
        const { id, situation, foldedSteps } = currentSimulation
        const result = await completeSimulationAction({
          id,
          progression,
          situation: situation as CompleteSimulationPayload['situation'],
          foldedSteps,
          computedResults: getComputedResults(engineContext),
        })
        if (
          result &&
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          !result.success
        ) {
          setExtra('simulationId', id)
          captureException(result.error)
        }
      })
    },
  }
}
