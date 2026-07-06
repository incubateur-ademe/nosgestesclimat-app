'use client'

import { getPublicPoll } from '@/services/organisations/get-public-poll'
import type { PublicOrganisationPoll } from '@/types/organisations'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'next/navigation'

export const useFetchPublicPoll = ({
  pollIdOrSlug,
  enabled = true,
}: {
  pollIdOrSlug?: string | string[] | null | undefined
  enabled?: boolean
} = {}): UseQueryResult<PublicOrganisationPoll | null, Error> => {
  const params = useParams()
  const searchParams = useSearchParams()

  const localPollIdOrSlug =
    pollIdOrSlug ?? params.pollSlug ?? searchParams.get('poll')

  return useQuery({
    queryKey: ['organisations', 'polls', localPollIdOrSlug],
    queryFn: () => getPublicPoll(localPollIdOrSlug as string),
    enabled: !!localPollIdOrSlug && enabled,
    retry: false,
  })
}
