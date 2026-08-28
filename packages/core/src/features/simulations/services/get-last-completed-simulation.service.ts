import { findLatestCompletedSimulation } from '../repository/simulation.repository.ts'
import type { Simulation } from '../types/simulation.ts'

export const getLastCompletedSimulation = async ({
  userId,
}: {
  userId: string
}): Promise<Simulation | null> => findLatestCompletedSimulation({ userId })
