import type {
  ActiveUserSimulationJourney,
  CompletedUserSimulationJourney,
  UserSimulationJourney,
} from '../types/simulation-progress.ts'

export const hasSimulation = (
  journey: UserSimulationJourney
): journey is ActiveUserSimulationJourney | CompletedUserSimulationJourney =>
  !!journey.currentSimulation

export const hasFreshSimulation = (
  journey: UserSimulationJourney
): journey is ActiveUserSimulationJourney | CompletedUserSimulationJourney =>
  journey.currentSimulation?.progression === 0

export const hasCurrentSimulationInProgress = (
  journey: UserSimulationJourney
): journey is ActiveUserSimulationJourney | CompletedUserSimulationJourney =>
  !!journey.currentSimulation &&
  journey.currentSimulation.progression > 0 &&
  journey.currentSimulation.progression < 1

export const hasCompletedCurrentSimulation = (
  journey: UserSimulationJourney
): journey is CompletedUserSimulationJourney =>
  journey.currentSimulation?.progression === 1

export const hasCompletedSimulation = (
  journey: UserSimulationJourney
): journey is CompletedUserSimulationJourney => !!journey.completedSimulation
