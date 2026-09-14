import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import { prisma } from '../../../../prisma/client.ts'
import type { ComputedResults } from '../../../simulations/validators/computed-results.schema.ts'

export const updatePollStats = (
  pollId: string,
  {
    computedResults,
    funFacts,
  }: { computedResults: ComputedResults; funFacts: FunFacts }
) =>
  prisma.poll.update({
    where: { id: pollId },
    data: { computedResults, funFacts },
  })
