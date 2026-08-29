'use client'

import { useCurrentSimulation } from '@/publicodes-state'
import { getComputedResults } from '@/publicodes-state/helpers/getComputedResults'
import { EngineContext } from '@/publicodes-state/providers/engineProvider/context'
import type { SimulationSituationPayload } from '@/services/simulations/update-simulation-situation'
import { updateSimulationSituation } from '@/services/simulations/update-simulation-situation'
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
    async (payload: SimulationSituationPayload) => {
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
    const {
      id,
      model,
      situation,
      extendedSituation,
      foldedSteps,
      progression,
    } = currentSimulation

    debouncedSave({
      id,
      model,
      situation,
      extendedSituation,
      foldedSteps,
      progression,
      // The engine holds fresher results than the provider state, which only
      // catches up on the next render.
      computedResults: getComputedResults(engineContext),
    })
  }, [currentSimulation.situation, currentSimulation.foldedSteps])
}
