import type { Simulation } from '../types/simulation.ts'

/**
 * A completed simulation is immutable: once its progression reached 1, it
 * can no longer be updated, even to stay completed.
 */
export const isSimulationCompleted = (
  simulation: Pick<Simulation, 'progression'>
): boolean => simulation.progression === 1
