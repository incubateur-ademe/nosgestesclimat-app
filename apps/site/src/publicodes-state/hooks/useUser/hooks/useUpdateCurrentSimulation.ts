'use client'

import type { Simulation } from '@/helpers/server/model/simulations'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback } from 'react'
import type { UpdateCurrentSimulationProps } from '../../../types'

interface Props {
  setSimulation: Dispatch<SetStateAction<Simulation | undefined>>
}

/**
 * Updates the current simulation in place. A no-op when there is none: a
 * simulation only exists once persisted server-side.
 */
export default function useUpdateCurrentSimulation({ setSimulation }: Props) {
  return useCallback(
    ({
      situation,
      foldedSteps,
      computedResults,
      progression,
    }: UpdateCurrentSimulationProps) => {
      setSimulation((prevSimulation) => {
        if (!prevSimulation) return prevSimulation

        const simulationToUpdate = { ...prevSimulation }

        if (situation !== undefined) {
          simulationToUpdate.situation = situation
        }

        if (foldedSteps !== undefined) {
          simulationToUpdate.foldedSteps =
            typeof foldedSteps === 'function'
              ? foldedSteps(simulationToUpdate.foldedSteps)
              : foldedSteps
        }

        if (computedResults !== undefined) {
          simulationToUpdate.computedResults = computedResults
        }

        if (progression !== undefined) {
          simulationToUpdate.progression = progression
        }

        return simulationToUpdate
      })
    },
    [setSimulation]
  )
}
