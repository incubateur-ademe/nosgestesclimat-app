'use server'

import { ORGANISATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { OrganisationPoll } from '@/types/organisations'

export const getOrganisationPolls = async (orgaSlug: string) =>
  fetchServer<OrganisationPoll[]>(`${ORGANISATION_URL}/${orgaSlug}/polls`)
