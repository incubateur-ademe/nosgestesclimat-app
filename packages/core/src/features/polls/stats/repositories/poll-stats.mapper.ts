import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import type { JsonValue } from '@prisma/client/runtime/client'
import type { ComputedResults } from '../../../simulations/validators/computed-results.schema.ts'
import type { PollStats } from '../types/poll-stats.ts'

export interface PollStatsRow {
  computedResults: JsonValue | null
  funFacts: JsonValue | null
}

/**
 * A poll is only exploitable once its aggregates have been computed: until
 * then there is no `ComputedResults` to expose, only a number of participants.
 */
export const toPollStats = (row: PollStatsRow): PollStats | null => {
  if (row.computedResults === null) {
    return null
  }

  return {
    computedResults: row.computedResults as ComputedResults,
    funFacts: (row.funFacts as FunFacts | null) ?? null,
  }
}
