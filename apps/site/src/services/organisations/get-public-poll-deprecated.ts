'use server'

import { ORGANISATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { PublicOrganisationPoll } from '@/types/organisations'

/**
 * @deprecated Prefer `@/services/polls/get-public-poll`, which reads the poll
 * from core and is cached across users. This one is still needed by
 * `useFetchPublicPoll` for the organisation dashboard, which reads the
 * user-specific `userComputedResults` / `otherComputedResults`.
 */
export const getPublicPollDeprecated = async (
  pollIdOrSlug: string
): Promise<PublicOrganisationPoll> => {
  return await fetchServer<PublicOrganisationPoll>(
    `${ORGANISATION_URL}/public-polls/${pollIdOrSlug}`
  )
}
