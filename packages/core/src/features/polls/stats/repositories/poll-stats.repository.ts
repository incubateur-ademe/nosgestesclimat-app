import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import { prisma } from '../../../../prisma/client.ts'
import type { ComputedResultSchema } from '../../../simulations/validators/computed-results.schema.ts'

export const countPollSimulations = (pollId: string) =>
  prisma.simulationPoll.count({ where: { pollId } })

export const updatePollStats = (
  pollId: string,
  {
    computedResults,
    funFacts,
  }: { computedResults: ComputedResultSchema; funFacts: FunFacts }
) =>
  prisma.poll.update({
    where: { id: pollId },
    data: { computedResults, funFacts },
  })
