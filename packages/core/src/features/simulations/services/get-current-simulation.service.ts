import { findLatestSimulation } from '../repository/simulation.repository.ts'
import type { Simulation } from '../types/simulation.ts'

export const getCurrentSimulation = async ({
  userId,
}: {
  userId: string
}): Promise<Simulation | null> => findLatestSimulation({ userId })
