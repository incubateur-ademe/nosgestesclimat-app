'use server'

import type { OrganisationTypeEnum } from '@/constants/organisations/organisationTypes'
import { ORGANISATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { Organisation } from '@/types/organisations'

interface OrganisationToCreate {
  name: string
  type: OrganisationTypeEnum
  numberOfCollaborators?: number
  administrators?: [
    {
      name?: string
      telephone?: string
      position?: string
      optedInForCommunications?: boolean
    },
  ]
}

export const createOrganisation = async ({
  organisation,
  locale,
}: {
  organisation: OrganisationToCreate
  locale?: string
}) => {
  const params = locale ? `?locale=${locale}` : ''

  return await fetchServer<Organisation>(`${ORGANISATION_URL}${params}`, {
    method: 'POST',
    body: organisation,
  })
}
