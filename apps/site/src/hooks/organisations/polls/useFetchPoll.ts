'use client'

import { getOrganisationPoll } from '@/services/organisations/get-organisation-poll'
import type { Organisation } from '@/types/organisations'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

export const useFetchPoll = (organisation?: Organisation) => {
  const { pollSlug: pollIdOrSlug } = useParams()

  return useQuery({
    queryKey: ['organisations', organisation?.slug, 'polls', pollIdOrSlug],
    queryFn: () =>
      getOrganisationPoll({
        orgaSlug: organisation!.slug,
        pollSlug: pollIdOrSlug as string,
      }),
    enabled: !!pollIdOrSlug && !!organisation,
  })
}
