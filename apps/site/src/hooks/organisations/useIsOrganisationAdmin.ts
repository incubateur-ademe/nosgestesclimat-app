'use client'

import { isOrganisationAdmin } from '@/services/organisations/is-organisation-admin'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

export function useIsOrganisationAdmin() {
  const { orgaSlug } = useParams()

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['isOrganisationAdmin', orgaSlug],
    queryFn: () => isOrganisationAdmin(orgaSlug as string),
    enabled: !!orgaSlug,
    retry: false,
  })

  return { isAdmin: !!isAdmin, isLoading }
}
