'use client'

import type { OrganisationTypeEnum } from '@/constants/organisations/organisationTypes'
import { createOrganisation } from '@/services/organisations/create-organisation'
import { useMutation } from '@tanstack/react-query'
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
    mutationFn: (organisation: OrganisationToCreate) =>
      createOrganisation({ organisation, locale }),
  })
}
