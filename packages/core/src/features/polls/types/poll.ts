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

/**
 * How many participants a poll needs before its results and its data may be
 * published, and whether it has them.
 *
 * Anonymity is discriminated on `isReached` so that anything reading a poll's
 * results has to travel through the reached state, and so that views never
 * rewrite the threshold in their copy.
 */
export type PollAnonymity = PollAnonymityNotReached | PollAnonymityReached

/** Not enough participants yet for anything to be published. */
export interface PollAnonymityNotReached {
  minParticipants: number
  isReached: false
}

/** Enough participants: what the poll shows is now up to the worker. */
export interface PollAnonymityReached {
  minParticipants: number
  isReached: true
}

export interface PollSummary {
  id: string
  name: string
  slug: string
  organisation: { slug: string }
}
