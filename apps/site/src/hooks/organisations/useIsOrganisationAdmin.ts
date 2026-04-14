'use client'

import useFetchOrganisation from '@/hooks/organisations/useFetchOrganisation'
import { useParams } from 'next/navigation'

export function useIsOrganisationAdmin() {
  const params = useParams()

  const { data: organisation, isLoading } = useFetchOrganisation()

  return { isAdmin: organisation?.slug === params.orgaSlug, isLoading }
}
