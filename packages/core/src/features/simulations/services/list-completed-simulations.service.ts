import { findCompletedSimulations } from '../repository/simulation.repository.ts'
import type { Simulation } from '../types/simulation.ts'

export const listCompletedSimulations = async ({
  userId,
  limit = 50,
}: {
  userId: string
  limit?: number
}): Promise<Simulation[]> => findCompletedSimulations({ userId, limit })
