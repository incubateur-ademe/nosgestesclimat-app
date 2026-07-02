'use server'

import { ORGANISATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { Organisation } from '@/types/organisations'

export async function getOrganisation(slug: string) {
  return await fetchServer<Organisation>(`${ORGANISATION_URL}/${slug}`)
}
