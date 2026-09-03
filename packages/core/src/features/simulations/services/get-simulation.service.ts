import { migrateSimulationIfNeeded } from '../helpers/migrate-simulation.ts'
import { findSimulationById } from '../repository/simulation.repository.ts'
import type { Simulation } from '../types/simulation.ts'

export const getSimulation = async ({
  id,
  userId,
}: {
  id: string
  userId: string
}): Promise<Simulation | null> => {
  const simulation = await findSimulationById({ id, userId })
  return simulation ? migrateSimulationIfNeeded(simulation) : null
}
