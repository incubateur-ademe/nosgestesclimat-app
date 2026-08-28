import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { Simulation } from '../types/simulation.ts'
import type { ComputedResultSchema } from '../validators/computed-results.schema.ts'
import { hasValidComputedResults } from '../validators/computed-results.schema.ts'
import { parseModelString } from './model.mapper.ts'

type SimulationRow = {
  id: string
  date: Date
  model: string
  progression: number
  situation: unknown
  extendedSituation: unknown
  foldedSteps: unknown
  actionChoices: unknown
  computedResults: unknown
  createdAt: Date
  updatedAt: Date
  userId: string | null
  polls: { pollId: string; poll: { slug: string; name: string } }[]
  groups: { groupId: string }[]
}

/**
 * Maps a Prisma row to the `Simulation` entity. Returns `null` when the model
 * string cannot be parsed or the `computedResults` do not match the current
 * shape. Legacy simulations predating this shape are kept in the database but
 * exposed as if they did not exist.
 */
export const mapSimulation = (row: SimulationRow): Simulation | null => {
  const model = parseModelString(row.model)
  if (!model) {
    return null
  }

  if (!hasValidComputedResults(row)) {
    return null
  }

  return {
    id: row.id,
    date: row.date,
    model,
    progression: row.progression,
    situation: row.situation as Situation<DottedName>,
    extendedSituation: row.extendedSituation as Simulation['extendedSituation'],
    foldedSteps: row.foldedSteps as DottedName[],
    actionChoices: row.actionChoices as Partial<Record<DottedName, boolean>>,
    computedResults: row.computedResults as ComputedResultSchema,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    userId: row.userId,
    polls: row.polls.map(({ pollId, poll }) => ({
      id: pollId,
      slug: poll.slug,
      name: poll.name,
    })),
    groups: row.groups.map(({ groupId }) => ({ id: groupId })),
  }
}
