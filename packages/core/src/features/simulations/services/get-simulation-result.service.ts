import { findManyGroupsBySimulationId } from '../../groups/repositories/group.repository.ts'
import type { Group } from '../../groups/types/group.ts'
import { findManyPollSummariesBySimulationId } from '../../polls/repositories/poll.repository.ts'
import type { PollSummary } from '../../polls/types/poll.ts'
import { migrateSimulationIfNeeded } from '../helpers/migrate-simulation.ts'
import { findSimulationById } from '../repository/simulation.repository.ts'
import type { Simulation } from '../types/simulation.ts'

export type Tendency = 'increase' | 'decrease'

export type SimulationResultGroupInfo =
  | { type: 'group'; value: Group }
  | { type: 'poll'; value: PollSummary }

export interface SimulationResult {
  simulation: Simulation
  group: SimulationResultGroupInfo | null
  tendency: Tendency | null
}

export const getSimulationResult = async ({
  id,
  userId,
}: {
  id: string
  userId: string
}): Promise<SimulationResult | null> => {
  const simulation = await findSimulationById({ id, userId })
  if (!simulation) return null

  const migratedSimulation = migrateSimulationIfNeeded(simulation)
  const group = await findSimulationResultGroup(migratedSimulation)

  return {
    simulation: migratedSimulation,
    group,
    tendency: null,
  }
}

/**
 * Resolves the group or poll a simulation belongs to, if any. Shared by
 * `getSimulationResult` and `getLatestSimulationResult`.
 */
export const findSimulationResultGroup = async (
  simulation: Simulation
): Promise<SimulationResultGroupInfo | null> => {
  // Most recent poll this simulation participated in
  const [poll] = await findManyPollSummariesBySimulationId({
    simulationId: simulation.id,
  })

  if (poll) {
    return { type: 'poll', value: poll }
  }

  // Most recent group this simulation participated in
  const [group] = await findManyGroupsBySimulationId({
    simulationId: simulation.id,
  })

  if (group) {
    return { type: 'group', value: group }
  }

  return null
}
