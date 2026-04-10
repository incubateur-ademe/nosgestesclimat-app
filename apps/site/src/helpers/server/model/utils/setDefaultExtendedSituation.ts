import { getInitialExtendedSituation } from '@/helpers/modelFetching/getInitialExtendedSituation'
import type { Simulation } from '@/publicodes-state/types'

export const setDefaultExtendedSituation = (simulation: Simulation) => {
  const updatedSimulation = { ...simulation }

  // Ensure extendedSituation is always defined (for old simulations that might not have it)
  if (!updatedSimulation.extendedSituation) {
    updatedSimulation.extendedSituation = getInitialExtendedSituation()
  }

  return updatedSimulation
}
