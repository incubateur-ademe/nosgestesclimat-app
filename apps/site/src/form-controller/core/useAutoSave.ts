'use client'

import { useCurrentSimulation, useEngine } from '@/publicodes-state'
import { updateSimulationSituation } from '@/services/simulations/update-simulation-situation'
import type { UpdateSimulationSituationPayload } from '@/services/simulations/update-simulation-situation-payload.schema'
import { useDebounce } from '@/utils/debounce'
import { getComputedResults } from '@nosgestesclimat/core/features/simulations/helpers/get-computed-results'
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
    const { id, model, situation, foldedSteps, progression } = currentSimulation

    // Nothing answered yet, nothing to save. The last answer waits for the
    // "Terminer" button: persisting a progression of 1 completes the simulation
    // server-side, which freezes it and redirects to the end page.
    if (progression === 0 || progression === 1) return

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
    // Only a new answer triggers a save; the other fields ride along.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSimulation.situation, currentSimulation.foldedSteps])

  // A hard navigation or a closed tab would drop the pending write.
  useEffect(() => {
    const flush = () => debouncedSave.flush()
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [debouncedSave])
}
