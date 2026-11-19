import type { SimulationStatus } from '../../../prisma/generated/client.ts'
import type { Simulation } from '../types/simulation.ts'

/** A simulation is completed once its result has been shown to the user, be it
 * the major questions one or the full one. */
export const COMPLETED_SIMULATION_STATUSES: readonly SimulationStatus[] = [
  'major_questions_result_seen',
  'full_result_seen',
]

export const isSimulationCompleted = (
  simulation: Pick<Simulation, 'status'>
): boolean => COMPLETED_SIMULATION_STATUSES.includes(simulation.status)
