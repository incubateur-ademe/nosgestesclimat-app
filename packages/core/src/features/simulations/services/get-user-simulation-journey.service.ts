import {
  findLatestCompletedSimulationProgress,
  findLatestSimulationProgress,
} from '../repository/simulation-progress.repository.ts'
import type { UserSimulationJourney } from '../types/simulation-progress.ts'

export const getUserSimulationJourney = async ({
  userId,
}: {
  userId: string
}): Promise<UserSimulationJourney> => {
  const [currentSimulation, completedSimulation] = await Promise.all([
    findLatestSimulationProgress({ userId }),
    findLatestCompletedSimulationProgress({ userId }),
  ])

  if (currentSimulation === null) {
    return {}
  }

  if (completedSimulation !== null) {
    return { currentSimulation, completedSimulation }
  }

  return { currentSimulation }
}
