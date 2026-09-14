import { getOrganisationPolls } from '@/helpers/server/model/organisations'
import { redirect } from 'next/navigation'

/**
 * `/organisations/:orgaSlug/resultats-detailles` redirects to the placeholder
 * slug `campagne-1`, which never exists: the campaign it meant is resolved here
 * instead.
 *
 * Listing an organisation's polls requires being signed in, so a visitor on a
 * legacy URL falls through to the 404 rather than to an arbitrary campaign.
 */
export const redirectFromLegacy = async (orgaSlug: string): Promise<void> => {
  const polls = await getOrganisationPolls(orgaSlug).catch(() => [])

  const firstPoll = polls.at(0)
  if (!firstPoll) return

  redirect(`/organisations/${orgaSlug}/campagnes/${firstPoll.slug}`)
}
