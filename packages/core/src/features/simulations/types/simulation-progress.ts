import type { SimulationStatus } from '../../../prisma/generated/client.ts'
import type { ModelString } from '../../models/helpers/model-versions.ts'

export interface SimulationProgress {
  id: string
  status: SimulationStatus
  model: ModelString
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
  completedSimulation: SimulationProgress
}

export type UserSimulationJourney =
  | EmptyUserSimulationJourney
  | ActiveUserSimulationJourney
  | CompletedUserSimulationJourney
