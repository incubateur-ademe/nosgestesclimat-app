'use client'

import { getOrganisation } from '@/services/organisations/get-organisation'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

export default function useFetchOrganisation() {
  const { orgaSlug } = useParams()

  return useQuery({
    queryKey: ['organisations', orgaSlug],
    queryFn: () => getOrganisation(orgaSlug as string),
    retry: false,
    enabled: !!orgaSlug,
  })
}
