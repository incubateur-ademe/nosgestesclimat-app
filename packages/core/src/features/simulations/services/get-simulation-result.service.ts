import { findGroupSummaryById } from '../../groups/repositories/group.repository.ts'
import type { GroupSummary } from '../../groups/types/group.ts'
import { findPollSummaryById } from '../../polls/repositories/poll.repository.ts'
import type { PollSummary } from '../../polls/types/poll.ts'
import { migrateSimulationIfNeeded } from '../helpers/migrate-simulation.ts'
import { findSimulationById } from '../repository/simulation.repository.ts'
import type { Simulation } from '../types/simulation.ts'

export type Tendency = 'increase' | 'decrease'

export type SimulationResultGroupInfo =
  | { type: 'group'; value: GroupSummary }
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
  if (simulation.groups?.length) {
    const groupSummary = await findGroupSummaryById({
      id: simulation.groups[0].id,
    })
    if (groupSummary) {
      return { type: 'group', value: groupSummary }
    }
  }

  if (simulation.polls?.length) {
    const pollSummary = await findPollSummaryById({
      id: simulation.polls[0].id,
    })
    if (pollSummary) {
      return { type: 'poll', value: pollSummary }
    }
  }

  return null
}
