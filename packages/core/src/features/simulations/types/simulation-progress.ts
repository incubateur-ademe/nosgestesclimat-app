export interface SimulationProgress {
  id: string
  progression: number
  model: string
}

export interface CompletedSimulationProgress extends SimulationProgress {
  progression: 1
}

export type UserSimulationProgress =
  | { currentSimulation?: undefined; completedSimulation?: undefined }
  | { currentSimulation: SimulationProgress; completedSimulation?: undefined }
  | {
      currentSimulation: SimulationProgress
      completedSimulation: CompletedSimulationProgress
    }
