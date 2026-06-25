'use server'

import { ORGANISATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { PublicOrganisationPoll } from '@/types/organisations'

export const getPublicPoll = async (
  pollIdOrSlug: string
): Promise<PublicOrganisationPoll> => {
  return await fetchServer<PublicOrganisationPoll>(
    `${ORGANISATION_URL}/public-polls/${pollIdOrSlug}`
  )
}
