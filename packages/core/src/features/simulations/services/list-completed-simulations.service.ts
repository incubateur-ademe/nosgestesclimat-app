import { findCompletedSimulations } from '../repository/simulation.repository.ts'
import type { Simulation } from '../types/simulation.ts'

export const listCompletedSimulations = async ({
  userId,
  limit = 10,
}: {
  userId: string
  limit?: number
}): Promise<Simulation[]> => findCompletedSimulations({ userId, limit })
