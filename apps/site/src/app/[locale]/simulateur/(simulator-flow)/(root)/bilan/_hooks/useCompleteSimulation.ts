import { useCurrentSimulation, useEngine } from '@/publicodes-state'
import { completeSimulation as completeSimulationAction } from '@/services/simulations/complete-simulation'
import type { CompleteSimulationPayload } from '@/services/simulations/complete-simulation-payload.schema'
import { getComputedResults } from '@nosgestesclimat/core/features/simulations/helpers/get-computed-results'
import { captureException, setExtra } from '@sentry/nextjs'
import { useTransition } from 'react'

export function useCompleteSimulation() {
  const currentSimulation = useCurrentSimulation()
  const [isPending, startTransition] = useTransition()
  const { engine } = useEngine()

  return {
    isPending,
    completeSimulation() {
      startTransition(async () => {
        const { id, model, progression, situation, foldedSteps } =
          currentSimulation
        // An incomplete simulation is not filtered out here on purpose: the
        // server answers with a `simulation_incomplete` failure, which lands in
        // Sentry below instead of being silently dropped.
        const result = await completeSimulationAction({
          id,
          model,
          progression,
          situation: situation as CompleteSimulationPayload['situation'],
          foldedSteps,
          computedResults: getComputedResults(engine),
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
