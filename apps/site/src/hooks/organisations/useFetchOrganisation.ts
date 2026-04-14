import { ORGANISATION_URL } from '@/constants/urls/main'
import { useUser } from '@/publicodes-state'
import type { Organisation } from '@/types/organisations'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useParams } from 'next/navigation'

export default function useFetchOrganisation() {
  const { orgaSlug } = useParams()
  const { user } = useUser()

  // Use organisationIdOrSlug or organisationId from the localstate
  const organisationIdOrSlug = orgaSlug || user?.organisation?.slug

  return useQuery({
    queryKey: ['organisations', organisationIdOrSlug],
    queryFn: () =>
      axios
        .get<Organisation>(`${ORGANISATION_URL}/${organisationIdOrSlug}`, {
          withCredentials: true,
        })
        .then((res) => res.data),
    retry: false,
    enabled: !!organisationIdOrSlug,
  })
}
