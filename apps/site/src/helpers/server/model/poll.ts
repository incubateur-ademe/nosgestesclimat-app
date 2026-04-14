'use server'
import { ORGANISATION_URL } from '@/constants/urls/main'
import type { PublicOrganisationPoll } from '@/types/organisations'
import type { AppUser } from '../dal/user'
import { fetchServer } from '../fetchServer'

export async function getPublicPoll({
  user,
  pollIdOrSlug: pollIdOrSlug,
}: {
  user: AppUser
  pollIdOrSlug: string
}): Promise<PublicOrganisationPoll> {
  return fetchServer<PublicOrganisationPoll>(
    `${ORGANISATION_URL}/${user.id}/public-polls/${pollIdOrSlug}`
  )
}
