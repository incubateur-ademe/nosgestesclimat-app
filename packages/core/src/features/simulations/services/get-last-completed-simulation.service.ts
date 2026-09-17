import { migrateSimulationIfNeeded } from '../helpers/migrate-simulation.ts'
import { findLatestCompletedSimulation } from '../repository/simulation.repository.ts'
import type { Simulation } from '../types/simulation.ts'

export const getLastCompletedSimulation = async ({
  userId,
}: {
  userId: string
}): Promise<Simulation | null> => {
  const simulation = await findLatestCompletedSimulation({ userId })
  return simulation ? migrateSimulationIfNeeded(simulation) : null
}
