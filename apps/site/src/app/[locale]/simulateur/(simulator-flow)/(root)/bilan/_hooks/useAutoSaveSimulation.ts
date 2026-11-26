'use client'

import { useCurrentSimulation, useEngine } from '@/publicodes-state'
import { updateSimulationSituation } from '@/services/simulations/update-simulation-situation'
import type { UpdateSimulationSituationPayload } from '@/services/simulations/update-simulation-situation-payload.schema'
import { useDebounce } from '@/utils/debounce'
import { getComputedResults } from '@nosgestesclimat/core/features/simulations/helpers/get-computed-results'
import { isSimulationCompleted } from '@nosgestesclimat/core/features/simulations/helpers/simulation-guards'
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
      // The result is not used here: the server logs the failure, with its
      // context.
      await updateSimulationSituation(payload)
    },
    5000
  )

  useEffect(() => {
    const { id, model, situation, foldedSteps, status } = currentSimulation

    /**
     * Persisting a completed status freezes the simulation server-side and
     * makes the simulator layout redirect to the end page. Completing is the
     * "Terminer" button's job, so the last answer waits for it.
     */
    if (status === 'not_started' || isSimulationCompleted({ status })) return

    debouncedSave({
      id,
      model,
      situation: situation as UpdateSimulationSituationPayload['situation'],
      foldedSteps,
      status,
      // The engine holds fresher results than the provider state, which only
      // catches up on the next render.
      computedResults: getComputedResults(engine),
    })
  }, [currentSimulation.situation, currentSimulation.foldedSteps])
}
