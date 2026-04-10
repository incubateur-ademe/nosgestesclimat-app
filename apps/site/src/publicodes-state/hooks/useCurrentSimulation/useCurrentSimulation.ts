'use client'

import useUser from '../useUser/useUser'

/**
 * A hook to get the current simulation and update it (via simulation.update() or updateCurrentSimulation())
 */
export default function useCurrentSimulation() {
  const { currentSimulation, updateCurrentSimulation } = useUser()

  return {
    ...currentSimulation,
    update: updateCurrentSimulation,
    updateCurrentSimulation,
  }
}
