import { ADMINISTRATOR_SEPARATOR } from '@/constants/organisations/administrator'
import type { OrganisationTypeEnum } from '@/constants/organisations/organisationTypes'
import { ORGANISATION_URL } from '@/constants/urls/main'
import type {
  OrgaSettingsInputsType,
  Organisation,
} from '@/types/organisations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

interface OrganisationToUpdate {
  name?: string
  type?: OrganisationTypeEnum | null
  numberOfCollaborators?: number | null
  administrators?: [
    {
      name?: string | null
      telephone?: string | null
      position?: string | null
      email?: string
      optedInForCommunications?: boolean
    },
  ]
}

export function useUpdateOrganisation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      organisationIdOrSlug,
      formData,
      code,
    }: {
      organisationIdOrSlug: string
      formData: OrgaSettingsInputsType
      email?: string
      code?: string
    }) => {
      const organisationToUpdate: OrganisationToUpdate = {
        ...(formData.name ? { name: formData.name } : {}),
        type: formData.organisationType,
        ...(formData.numberOfCollaborators && +formData.numberOfCollaborators
          ? { numberOfCollaborators: +formData.numberOfCollaborators }
          : { numberOfCollaborators: null }),
        administrators: [
          {
            ...(formData.administratorFirstName
              ? {
                  name: `${formData.administratorFirstName}${ADMINISTRATOR_SEPARATOR}${formData.administratorLastName ?? ''}`,
                }
              : { name: null }),
            ...(formData.administratorTelephone
              ? { telephone: formData.administratorTelephone }
              : { telephone: null }),
            ...(formData.position
              ? { position: formData.position }
              : { position: null }),
          },
        ],
      }

      return axios
        .put<Organisation>(
          `${ORGANISATION_URL}/${organisationIdOrSlug}`,
          organisationToUpdate,
          {
            withCredentials: true,
            params: {
              code,
            },
          }
        )
        .then((response) => ({
          ...response.data,
          userId: response.data.administrators[0].userId,
        }))
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['organisations'],
      }),
  })
}
