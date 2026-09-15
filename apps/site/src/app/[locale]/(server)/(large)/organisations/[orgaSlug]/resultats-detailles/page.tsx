import { getOrganisationPolls } from '@/helpers/server/model/organisations'
import { notFound, redirect } from 'next/navigation'

/**
 * The address the organisation dashboard used before the poll redesign. There
 * is nothing to show at that level any more: results belong to a campaign, so
 * this page hands over to the organisation's first one.
 *
 * Listing an organisation's polls requires being signed in. An unreadable list
 * is therefore a 404, where an empty one means the administrator has no campaign
 * yet and is sent where it can create one.
 */
export default async function LegacyPollResultsPage({
  params,
}: PageProps<'/[locale]/organisations/[orgaSlug]/resultats-detailles'>) {
  const { orgaSlug } = await params

  const polls = await getOrganisationPolls(orgaSlug).catch(() => null)
  if (polls === null) notFound()

  const firstPoll = polls.at(0)
  if (!firstPoll) redirect(`/organisations/${orgaSlug}`)

  redirect(`/organisations/${orgaSlug}/campagnes/${firstPoll.slug}`)
}
