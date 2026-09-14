import type { PollAnonymity } from '../types/poll.ts'

/**
 * Below this many participants, a poll publishes neither its aggregates nor its
 * data: a mean computed over one or two people is those people's own answers.
 */
export const ANONYMITY_THRESHOLD = 3

/** The threshold, and whether that many people took part. */
export const resolveAnonymity = (participants: number): PollAnonymity =>
  participants < ANONYMITY_THRESHOLD
    ? { minParticipants: ANONYMITY_THRESHOLD, isReached: false }
    : { minParticipants: ANONYMITY_THRESHOLD, isReached: true }
