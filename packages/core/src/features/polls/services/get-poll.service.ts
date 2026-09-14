import { findPollByIdOrSlug } from '../repositories/poll.repository.ts'
import type { Poll } from '../types/poll.ts'

export const getPoll = async ({
  pollIdOrSlug,
}: {
  pollIdOrSlug: string
}): Promise<Poll | null> => {
  return findPollByIdOrSlug({ pollIdOrSlug })
}
