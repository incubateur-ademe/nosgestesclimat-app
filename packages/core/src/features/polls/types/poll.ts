import type { PollMode } from '../../../prisma/generated/client.ts'

export interface Poll {
  id: string
  name: string
  slug: string
  mode: PollMode
  /** Finished simulations, as of the last stats recomputation. */
  participantsCount: number
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
 * How many participants a poll needs before its results and its data may be
 * published, and whether it has them.
 *
 * Anonymity is discriminated on `isReached` so that anything reading a poll's
 * stats has to travel through the reached state, and so that views never
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
  mode: PollMode
  organisation: { name: string; slug: string }
}
