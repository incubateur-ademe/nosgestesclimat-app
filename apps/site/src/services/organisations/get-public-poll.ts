'use server'

import { ORGANISATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import { getUserSession } from '@/services/auth/get-user-session'
import type { PublicOrganisationPoll } from '@/types/organisations'

export const getPublicPoll = async (pollSlug: string) => {
  const session = await getUserSession()
  if (!session) return null

  return fetchServer<PublicOrganisationPoll>(
    `${ORGANISATION_URL}/${session.id}/public-polls/${pollSlug}`
  )
}
