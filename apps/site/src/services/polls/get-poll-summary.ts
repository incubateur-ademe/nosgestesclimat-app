import { CACHE_PROFILES } from '@/constants/cache'
import { getPollSummary as getPollSummaryService } from '@nosgestesclimat/core/features/polls/services/get-poll-summary.service'
import type { PollSummary } from '@nosgestesclimat/core/features/polls/types/poll'
import { cacheLife } from 'next/cache'

/**
 * Cached 5 minutes and shared by every visitor: the payload carries no data
 * about the current user.
 *
 * Returns `null` when no poll matches, leaving it to the caller to decide how
 * absence is surfaced (a 404 page, a tolerated `null`, ...).
 */
export async function getPollSummary(
  pollIdOrSlug: string
): Promise<PollSummary | null> {
  'use cache'
  cacheLife(CACHE_PROFILES.FIVE_MINUTES)

  return await getPollSummaryService({ pollIdOrSlug })
}
