'use client'

import { ADMINISTRATOR_SEPARATOR } from '@/constants/organisations/administrator'
import {
  updateOrganisation,
  type OrganisationToUpdate,
} from '@/services/organisations/update-organisation'
import type { OrgaSettingsInputsType } from '@/types/organisations'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdateOrganisation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      organisationIdOrSlug,
      formData,
    }: {
      organisationIdOrSlug: string
      formData: OrgaSettingsInputsType
    }) => {
      const organisationToUpdate = {
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

      return await updateOrganisation({
        organisationIdOrSlug,
        organisation: organisationToUpdate as OrganisationToUpdate,
      })
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['organisations'],
      }),
  })
}
