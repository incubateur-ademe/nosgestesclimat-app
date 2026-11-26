import type {
  ActiveUserSimulationJourney,
  CompletedUserSimulationJourney,
  SimulationProgress,
  UserSimulationJourney,
} from '../types/simulation-progress.ts'
import { isSimulationCompleted } from './simulation-guards.ts'

const isStarted = (simulation: SimulationProgress) =>
  simulation.status !== 'not_started'

export const hasSimulation = (
  journey: UserSimulationJourney
): journey is ActiveUserSimulationJourney | CompletedUserSimulationJourney =>
  !!journey.currentSimulation

export const hasUnstartedSimulation = (
  journey: UserSimulationJourney
): journey is ActiveUserSimulationJourney | CompletedUserSimulationJourney =>
  !!journey.currentSimulation && !isStarted(journey.currentSimulation)

export const hasCurrentSimulationInProgress = (
  journey: UserSimulationJourney
): journey is ActiveUserSimulationJourney | CompletedUserSimulationJourney =>
  !!journey.currentSimulation &&
  isStarted(journey.currentSimulation) &&
  !isSimulationCompleted(journey.currentSimulation)

export const hasCompletedCurrentSimulation = (
  journey: UserSimulationJourney
): journey is CompletedUserSimulationJourney =>
  !!journey.currentSimulation &&
  isSimulationCompleted(journey.currentSimulation)

export const hasCompletedSimulation = (
  journey: UserSimulationJourney
): journey is CompletedUserSimulationJourney => !!journey.completedSimulation
