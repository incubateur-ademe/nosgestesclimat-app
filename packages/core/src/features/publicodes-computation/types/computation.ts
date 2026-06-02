import type { ComputationStatus } from '../../../prisma/generated/enums.ts'

export type { ComputationStatus }

export interface SimulationComputation {
  simulationId: string
  status: ComputationStatus
  startedAt: Date | null
  completedAt: Date | null
  error: string | null
}
