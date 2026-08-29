import { migrateSimulationIfNeeded } from '../helpers/migrate-simulation.ts'
import { findCompletedSimulations } from '../repository/simulation.repository.ts'
import type { Simulation } from '../types/simulation.ts'

export const listCompletedSimulations = async ({
  userId,
  limit = 10,
}: {
  userId: string
  limit?: number
}): Promise<Simulation[]> => {
  const simulations = await findCompletedSimulations({ userId, limit })

  return simulations.map((simulation) => migrateSimulationIfNeeded(simulation))
}
