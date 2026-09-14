import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import type { JsonValue } from '@prisma/client/runtime/client'
import type { PollMode } from '../../../prisma/generated/client.ts'
import type { ComputedResults } from '../../simulations/validators/computed-results.schema.ts'
import type { Poll, PollStats } from '../types/poll.ts'

export interface PollRow {
  id: string
  name: string
  slug: string
  mode: PollMode
  organisationId: string
  expectedNumberOfParticipants: number | null
  createdAt: Date
  updatedAt: Date
  organisation: {
    id: string
    name: string
    slug: string
  }
}

export const toPoll = (row: PollRow): Poll => {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    mode: row.mode,
    expectedNumberOfParticipants: row.expectedNumberOfParticipants,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    organisation: row.organisation,
  }
}

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
