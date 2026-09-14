import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import type { JsonValue } from '@prisma/client/runtime/client'
import type { PollMode } from '../../../prisma/generated/client.ts'
import type { ComputedResults } from '../../simulations/validators/computed-results.schema.ts'
import type { Poll } from '../types/poll.ts'

export interface PollRow {
  id: string
  name: string
  slug: string
  mode: PollMode
  organisationId: string
  expectedNumberOfParticipants: number | null
  funFacts: JsonValue | null
  computedResults: JsonValue | null
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
    funFacts: (row.funFacts as FunFacts | null) ?? null,
    computedResults: (row.computedResults as ComputedResults | null) ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    organisation: row.organisation,
  }
}
