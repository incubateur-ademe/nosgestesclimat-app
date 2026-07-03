'use server'

import type { OrganisationTypeEnum } from '@/constants/organisations/organisationTypes'
import { ORGANISATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { Organisation } from '@/types/organisations'

export interface OrganisationToUpdate {
  name?: string
  type?: OrganisationTypeEnum | null
  numberOfCollaborators?: number | null
  administrators?: [
    {
      name?: string | null
      telephone?: string | null
      position?: string | null
      optedInForCommunications?: boolean
    },
  ]
}

export const updateOrganisation = async ({
  organisationIdOrSlug,
  organisation,
}: {
  organisationIdOrSlug: string
  organisation: OrganisationToUpdate
}) => {
  return await fetchServer<Organisation>(
    `${ORGANISATION_URL}/${organisationIdOrSlug}`,
    {
      method: 'PUT',
      body: organisation,
    }
  )
}
