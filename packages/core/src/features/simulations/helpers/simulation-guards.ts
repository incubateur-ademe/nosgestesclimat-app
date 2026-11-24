import type { SimulationStatus } from '../../../prisma/generated/client.ts'
import type { Simulation } from '../types/simulation.ts'

/** A simulation is completed once its result has been shown to the user, be it
 * the major questions one or the full one. */
export const COMPLETED_SIMULATION_STATUSES = [
  'major_questions_result_seen',
  'full_result_seen',
] as const satisfies readonly SimulationStatus[]

export type CompletedSimulationStatus =
  (typeof COMPLETED_SIMULATION_STATUSES)[number]

const COMPLETED_SIMULATION_STATUS_SET: ReadonlySet<SimulationStatus> = new Set(
  COMPLETED_SIMULATION_STATUSES
)

export const isCompletedSimulationStatus = (
  status: SimulationStatus
): status is CompletedSimulationStatus =>
  COMPLETED_SIMULATION_STATUS_SET.has(status)

export const isSimulationCompleted = (
  simulation: Pick<Simulation, 'status'>
): boolean => COMPLETED_SIMULATION_STATUS_SET.has(simulation.status)
