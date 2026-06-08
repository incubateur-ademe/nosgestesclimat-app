import type { ComputationStatus } from '../../../prisma/generated/enums.ts'

export type SimulationComputationStatus = ComputationStatus

export interface SimulationComputation {
  simulationId: string
  status: SimulationComputationStatus
  startedAt: Date | null
  completedAt: Date | null
  error: string | null
}
