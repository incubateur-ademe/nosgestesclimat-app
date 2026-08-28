import {
  findLatestCompletedSimulationProgress,
  findLatestSimulationProgress,
} from '../repository/simulation-progress.repository.ts'
import type { UserSimulationProgress } from '../types/simulation-progress.ts'

const toProgress = <Progression extends number>(
  row: {
    id: string
    progression: Progression
    model: string
  } | null
): { id: string; progression: Progression; model: string } | undefined =>
  row
    ? { id: row.id, progression: row.progression, model: row.model }
    : undefined

export const getUserSimulationProgress = async ({
  userId,
}: {
  userId: string
}): Promise<UserSimulationProgress> => {
  const [latest, latestCompleted] = await Promise.all([
    findLatestSimulationProgress({ userId }),
    findLatestCompletedSimulationProgress({ userId }),
  ])

  const currentSimulation = toProgress(latest)
  const completedSimulation = toProgress(latestCompleted)

  if (!currentSimulation) {
    return {}
  }

  if (completedSimulation) {
    return { currentSimulation, completedSimulation }
  }

  return { currentSimulation }
}
