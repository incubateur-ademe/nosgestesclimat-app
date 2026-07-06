'use client'

import { getOrganisationPolls } from '@/services/organisations/get-organisation-polls'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

export function useFetchPolls({ enabled }: { enabled: boolean }) {
  const { orgaSlug: organisationIdOrSlug } = useParams()

  return useQuery({
    queryKey: ['organisations', organisationIdOrSlug, 'polls'],
    queryFn: () => getOrganisationPolls(organisationIdOrSlug as string),
    enabled,
  })
}
