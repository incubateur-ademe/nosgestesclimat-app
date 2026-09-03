'use client'

import { useCurrentSimulation } from '@/publicodes-state'
import { getComputedResults } from '@/publicodes-state/helpers/getComputedResults'
import { EngineContext } from '@/publicodes-state/providers/engineProvider/context'
import { updateSimulationSituation } from '@/services/simulations/update-simulation-situation'
import type { UpdateSimulationSituationPayload } from '@/services/simulations/update-simulation-situation-payload.schema'
import { useDebounce } from '@/utils/debounce'
import { captureException, setExtra } from '@sentry/nextjs'
import { useContext, useEffect } from 'react'

/**
 * Saves the answers of the simulation being taken, at most once every 3
 * seconds.
 */
export function useAutoSaveSimulation() {
  const currentSimulation = useCurrentSimulation()
  const engineContext = useContext(EngineContext)

  const debouncedSave = useDebounce(
    async (payload: UpdateSimulationSituationPayload) => {
      const result = await updateSimulationSituation(payload)

      if (!result.success) {
        setExtra('simulationId', payload.id)
        setExtra('situation', JSON.stringify(payload.situation))
        captureException(result.error)
      }
    },
    3000
  )

  useEffect(() => {
    const { id, model, situation, foldedSteps, progression } = currentSimulation

    // Avoid useless server calls and let completion be handled at the end of the test
    if (progression === 0 || progression === 1) return

    debouncedSave({
      id,
      model,
      situation: situation as UpdateSimulationSituationPayload['situation'],
      foldedSteps,
      progression,
      // The engine holds fresher results than the provider state, which only
      // catches up on the next render.
      computedResults: getComputedResults(engineContext),
    })
  }, [currentSimulation.situation, currentSimulation.foldedSteps])
}
