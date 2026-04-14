import { ORGANISATION_URL } from '@/constants/urls/main'
import type { Organisation, OrganisationPoll } from '@/types/organisations'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useParams } from 'next/navigation'

export const useFetchPoll = (organisation?: Organisation) => {
  const { pollSlug: pollIdOrSlug } = useParams()

  return useQuery({
    queryKey: ['organisations', organisation?.slug, 'polls', pollIdOrSlug],
    queryFn: () =>
      axios
        .get<OrganisationPoll>(
          `${ORGANISATION_URL}/${organisation?.slug}/polls/${pollIdOrSlug}`,
          {
            withCredentials: true,
          }
        )
        .then((res) => res.data),
    enabled: !!pollIdOrSlug && !!organisation,
  })
}
