import { useParams, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useFetchPolls } from './polls/useFetchPolls'

// Handles managing the redirection from the previous implementation of the parcours orga
// /organisations/:orgaSlug/resultats-detailles => /organisations/:orgaSlug/campagnes/:pollSlug
export function useHandleRedirectFromLegacy() {
  const { orgaSlug: organisationIdOrSlug } = useParams()

  const enabled = Boolean(useSearchParams().get('isRedirectFromLegacy'))

  const { data: polls } = useFetchPolls({
    enabled,
  })

  useEffect(() => {
    if (enabled && polls) {
      const [poll] = polls
      window.location.href = `/organisations/${organisationIdOrSlug}/campagnes/${poll.slug}`
    }
  }, [enabled, polls, organisationIdOrSlug])
}
