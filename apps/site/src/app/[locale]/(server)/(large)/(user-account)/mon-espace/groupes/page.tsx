import EmptyState from '@/components/results/groups/EmptyState'
import Groups from '@/components/results/groups/Groups'
import Organisation from '@/components/results/groups/Organisation'
import { buildAlternates } from '@/helpers/metadata/getMetadataObject'
import { getGroups } from '@/helpers/server/model/groups'
import { getUserOrganisation } from '@/helpers/server/model/organisations'
import type { DefaultPageProps } from '@/types'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: DefaultPageProps): Promise<Metadata> {
  const { locale } = await params

  return {
    alternates: buildAlternates({ locale, canonical: '/mon-espace/groupes' }),
  }
}

export default async function GroupsDashboard() {
  const [organisation, groups] = await Promise.all([
    getUserOrganisation(),
    getGroups(),
  ])

  if (!organisation && !groups.length) {
    return <EmptyState />
  }

  return (
    <>
      <Organisation organisation={organisation} />

      <Groups groups={groups} />
    </>
  )
}
