export interface SimulationProgress {
  id: string
  progression: number
  model: string
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
