import type { Prisma } from '../../../prisma/generated/client.ts'
import { getEmptyComputedResults } from '../helpers/get-empty-computed-results.ts'
import type { SimulationResult } from '../types/simulation-result.ts'

interface DbSimulationWithRelations extends Prisma.SimulationModel {
  groups: Array<{
    group: Pick<Prisma.GroupModel, 'id' | 'name'>
  }>
  polls: Array<{
    poll: Pick<Prisma.PollModel, 'id' | 'name' | 'slug'>
  }>
}

export const mapSimulationResult = (
  db: DbSimulationWithRelations
): SimulationResult => {
  const firstGroup = db.groups[0]
  const firstPoll = db.polls[0]

  return {
    // @TODO validate computedResults
    computedResults: (db.computedResults ??
      getEmptyComputedResults()) as SimulationResult['computedResults'],
    group: firstGroup
      ? { id: firstGroup.group.id, name: firstGroup.group.name }
      : null,
    poll: firstPoll
      ? {
          id: firstPoll.poll.id,
          name: firstPoll.poll.name,
          slug: firstPoll.poll.slug,
        }
      : null,
  }
}
