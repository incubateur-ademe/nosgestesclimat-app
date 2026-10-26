import type { ModelString } from '../../models/helpers/model-versions.ts'

export interface SimulationProgress {
  id: string
  progression: number
  model: ModelString
}

export interface CompletedSimulationProgress extends SimulationProgress {
  progression: 1
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
  completedSimulation: CompletedSimulationProgress
}

export type UserSimulationJourney =
  | EmptyUserSimulationJourney
  | ActiveUserSimulationJourney
  | CompletedUserSimulationJourney
