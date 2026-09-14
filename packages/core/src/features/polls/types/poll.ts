import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import type { PollMode } from '../../../prisma/generated/client.ts'
import type { ComputedResults } from '../../simulations/validators/computed-results.schema.ts'

export interface Poll {
  id: string
  name: string
  slug: string
  mode: PollMode
  expectedNumberOfParticipants: number | null
  createdAt: Date
  updatedAt: Date
  organisation: {
    id: string
    name: string
    slug: string
  }
}

/**
 * The aggregates the worker computed for a poll.
 *
 * They are deliberately absent from `Poll`: a read of the poll itself must not
 * carry them, so that exposing results always goes through the rule deciding
 * whether they may be published.
 */
export interface PollResults {
  computedResults: ComputedResults
  funFacts: FunFacts | null
}

export interface PollSummary {
  id: string
  name: string
  slug: string
  organisation: { slug: string }
}
