import { ORGANISATION_URL } from '@/constants/urls/main'
import { useUser } from '@/publicodes-state'
import type { PublicOrganisationPoll } from '@/types/organisations'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import axios from 'axios'
import { useParams, useSearchParams } from 'next/navigation'

export const useFetchPublicPoll = ({
  pollIdOrSlug,
  enabled = true,
}: {
  pollIdOrSlug?: string | string[] | null | undefined
  enabled?: boolean
} = {}): UseQueryResult<PublicOrganisationPoll, Error> => {
  const params = useParams()
  const searchParams = useSearchParams()

  const localPollIdOrSlug =
    pollIdOrSlug ?? params.pollSlug ?? searchParams.get('poll')

  const {
    user: { userId },
  } = useUser()

  return useQuery({
    queryKey: ['organisations', userId, 'polls', localPollIdOrSlug],
    queryFn: () =>
      axios
        .get<PublicOrganisationPoll>(
          `${ORGANISATION_URL}/${userId}/public-polls/${localPollIdOrSlug as string}`,
          {
            withCredentials: true,
          }
        )
        .then((res) => res.data),
    enabled: !!localPollIdOrSlug && enabled,
    retry: false,
  })
}
