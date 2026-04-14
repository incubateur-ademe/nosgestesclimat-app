import type { OrganisationTypeEnum } from '@/constants/organisations/organisationTypes'
import { ORGANISATION_URL } from '@/constants/urls/main'
import type { Organisation } from '@/types/organisations'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useLocale } from '../useLocale'

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

export function useCreateOrganisation() {
  const locale = useLocale()

  return useMutation({
    mutationFn: (organisationToCreate: OrganisationToCreate) =>
      axios
        .post<Organisation>(ORGANISATION_URL, organisationToCreate, {
          params: {
            locale,
          },
          withCredentials: true,
        })
        .then((response) => response.data),
  })
}
