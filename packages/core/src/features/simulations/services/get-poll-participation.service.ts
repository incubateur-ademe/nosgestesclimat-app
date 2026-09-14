import { migrateSimulationIfNeeded } from '../helpers/migrate-simulation.ts'
import { findLatestPollSimulation } from '../repository/simulation.repository.ts'
import type { Simulation } from '../types/simulation.ts'

export const getPollParticipation = async ({
  userId,
  pollIdOrSlug,
}: {
  userId: string
  pollIdOrSlug: string
}): Promise<Simulation | null> => {
  const simulation = await findLatestPollSimulation({ userId, pollIdOrSlug })
  return simulation ? migrateSimulationIfNeeded(simulation) : null
}
