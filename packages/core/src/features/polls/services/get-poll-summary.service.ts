import { findPollSummaryByIdOrSlug } from '../repositories/poll.repository.ts'
import type { PollSummary } from '../types/poll.ts'

/**
 * The poll as a visitor-facing page needs it: enough to name it, to link to it,
 * and to know how it runs. What an organisation administrator configured
 * (`expectedNumberOfParticipants`) and when the poll was created stay out of
 * this read.
 */
export const getPollSummary = async ({
  pollIdOrSlug,
}: {
  pollIdOrSlug: string
}): Promise<PollSummary | null> => {
  return findPollSummaryByIdOrSlug({ pollIdOrSlug })
}
