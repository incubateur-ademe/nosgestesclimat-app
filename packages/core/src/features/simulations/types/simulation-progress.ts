import type { SimulationStatus } from '../../../prisma/generated/client.ts'
import type { ModelString } from '../../models/helpers/model-versions.ts'
import type { CompletedSimulationStatus } from '../helpers/simulation-guards.ts'

export interface SimulationProgress {
  id: string
  status: SimulationStatus
  model: ModelString
}

export interface CompletedSimulation extends Omit<
  SimulationProgress,
  'status'
> {
  status: CompletedSimulationStatus
}

export interface EmptyUserSimulationJourney {
  currentSimulation?: undefined
  completedSimulation?: undefined
}

export interface ActiveUserSimulationJourney {
  currentSimulation: SimulationProgress
  completedSimulation?: undefined
}

export interface CompletedUserSimulationJourney {
  currentSimulation: SimulationProgress
  completedSimulation: CompletedSimulation
}

export type UserSimulationJourney =
  | EmptyUserSimulationJourney
  | ActiveUserSimulationJourney
  | CompletedUserSimulationJourney
