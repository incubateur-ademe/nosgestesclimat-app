import { ORGANISATION_URL } from '@/constants/urls/main'
import type { OrganisationPoll } from '@/types/organisations'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useParams } from 'next/navigation'

export function useFetchPolls({ enabled }: { enabled: boolean }) {
  const { orgaSlug: organisationIdOrSlug } = useParams()

  return useQuery({
    queryKey: ['organisations', organisationIdOrSlug, 'polls'],
    queryFn: () =>
      axios
        .get<
          OrganisationPoll[]
        >(`${ORGANISATION_URL}/${organisationIdOrSlug}/polls`, { withCredentials: true })
        .then((res) => res.data),
    enabled,
  })
}
