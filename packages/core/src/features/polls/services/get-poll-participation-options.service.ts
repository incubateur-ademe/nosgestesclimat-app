import { getSimulationMode } from '../../simulations/helpers/get-simulation-mode.ts'
import { migrateSimulationIfNeeded } from '../../simulations/helpers/migrate-simulation.ts'
import {
  findLatestCompletedSimulation,
  findLatestPollSimulation,
} from '../../simulations/repository/simulation.repository.ts'
import type { Simulation } from '../../simulations/types/simulation.ts'
import { findManyPollSummariesBySimulationId } from '../repositories/poll.repository.ts'
import type { Poll, PollSummary } from '../types/poll.ts'

export type PollParticipationOptions =
  | {
      currentPollSimulation: Simulation | null
      canReuseExistingSimulation: false
    }
  | {
      currentPollSimulation: Simulation | null
      canReuseExistingSimulation: true
      reusableSimulation: Simulation
      reusableSimulationPolls: PollSummary[]
    }

export const getPollParticipationOptions = async ({
  poll,
  userId,
}: {
  poll: Poll
  userId: string
}): Promise<PollParticipationOptions> => {
  const [currentPollSimulation, maybeReusableSimulation] = await Promise.all([
    findLatestPollSimulation({ userId, pollIdOrSlug: poll.id }),
    findLatestCompletedSimulation({ userId }),
  ])

  const migratedCurrentPollSimulation = currentPollSimulation
    ? migrateSimulationIfNeeded(currentPollSimulation)
    : null
  const migratedReusableSimulation = maybeReusableSimulation
    ? migrateSimulationIfNeeded(maybeReusableSimulation)
    : null

  // A completed simulation is only offered for reuse when :
  // - the previous completed simulation has "mode" === "standard"
  // - the newer simulation also has "mode" === "standard"
  const canReuseExistingSimulation =
    !!migratedReusableSimulation &&
    poll.mode === 'standard' &&
    getSimulationMode(migratedReusableSimulation) === 'standard' &&
    !migratedCurrentPollSimulation &&
    Date.now() - migratedReusableSimulation.date.getTime() <
      6 * 30 * 24 * 3600 * 1000

  if (!canReuseExistingSimulation) {
    return {
      currentPollSimulation: migratedCurrentPollSimulation,
      canReuseExistingSimulation: false,
    }
  }

  const reusableSimulationPolls = await findManyPollSummariesBySimulationId({
    simulationId: migratedReusableSimulation.id,
  })

  return {
    currentPollSimulation: migratedCurrentPollSimulation,
    canReuseExistingSimulation,
    reusableSimulation: migratedReusableSimulation!,
    reusableSimulationPolls,
  }
}
