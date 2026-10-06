'use client'

import { useCurrentSimulation, useEngine } from '@/publicodes-state'
import { updateSimulationSituation } from '@/services/simulations/update-simulation-situation'
import type { UpdateSimulationSituationPayload } from '@/services/simulations/update-simulation-situation-payload.schema'
import { useDebounce } from '@/utils/debounce'
import { getComputedResults } from '@nosgestesclimat/core/features/simulations/helpers/get-computed-results'
import { captureException, setExtra } from '@sentry/nextjs'
import { useEffect } from 'react'

/**
 * Saves the answers of the simulation being taken, trailing the last change by
 * 5 seconds: the delay is what turns a burst of answers into a single write.
 */
export function useAutoSaveSimulation() {
  const currentSimulation = useCurrentSimulation()
  const { engine } = useEngine()

  const debouncedSave = useDebounce(
    async (payload: UpdateSimulationSituationPayload) => {
      const result = await updateSimulationSituation(payload)

      if (!result.success) {
        setExtra('simulationId', payload.id)
        setExtra('situation', JSON.stringify(payload.situation))
        captureException(result.error)
      }
    },
    5000
  )

  useEffect(() => {
    const { id, model, situation, foldedSteps, progression } = currentSimulation

    // Avoid useless server calls and let completion be handled at the end of the test
    if (progression === 0 || progression === 1) return

    /**
     * Persisting a progression of 1 completes the simulation server-side, which
     * freezes it and makes the simulator layout redirect to the end page.
     * Completing is the "Terminer" button's job, so the last answer waits for it.
     */
    if (progression === 1) return

    debouncedSave({
      id,
      model,
      situation: situation as UpdateSimulationSituationPayload['situation'],
      foldedSteps,
      progression,
      // The engine holds fresher results than the provider state, which only
      // catches up on the next render.
      computedResults: getComputedResults(engine),
    })
  }, [currentSimulation.situation, currentSimulation.foldedSteps])
}
