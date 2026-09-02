import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { Simulation } from '../types/simulation.ts'
import {
  hasValidComputedResults,
  type ComputedResults,
} from '../validators/computed-results.schema.ts'
import { parseModelString } from './model.mapper.ts'

type SimulationRow = {
  id: string
  date: Date
  model: string
  progression: number
  situation: unknown
  foldedSteps: unknown
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
    foldedSteps: row.foldedSteps as DottedName[],
    computedResults: row.computedResults as ComputedResults,
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
