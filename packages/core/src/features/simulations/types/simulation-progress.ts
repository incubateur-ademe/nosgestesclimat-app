import type { SimulationStatus } from '../../../prisma/generated/client.ts'
import type { ModelString } from '../../models/helpers/model-versions.ts'

export interface SimulationProgress {
  id: string
  progression: number
  status: SimulationStatus
  model: ModelString
}

interface CompletedSimulation {
  id: string
  progression: number
  status: Extract<
    SimulationStatus,
    'major_questions_result_seen' | 'full_result_seen'
  >
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
  completedSimulation: CompletedSimulation
}

export type UserSimulationJourney =
  | EmptyUserSimulationJourney
  | ActiveUserSimulationJourney
  | CompletedUserSimulationJourney
