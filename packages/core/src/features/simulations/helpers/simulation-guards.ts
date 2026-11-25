import type { SimulationStatus } from '../../../prisma/generated/client.ts'
import type { Simulation } from '../types/simulation.ts'

/** A simulation is completed once its full result has been shown to the user.
 * The intermediate `answering_major_questions` state stays editable. */
export const COMPLETED_SIMULATION_STATUSES = [
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
