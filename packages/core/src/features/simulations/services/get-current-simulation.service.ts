import { migrateSimulationIfNeeded } from '../helpers/migrate-simulation.ts'
import { findLatestSimulation } from '../repository/simulation.repository.ts'
import type { Simulation } from '../types/simulation.ts'

export const getCurrentSimulation = async ({
  userId,
}: {
  userId: string
}): Promise<Simulation | null> => {
  const simulation = await findLatestSimulation({ userId })
  return simulation ? migrateSimulationIfNeeded(simulation) : null
}
