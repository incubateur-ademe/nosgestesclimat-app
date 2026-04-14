import EmptyState from '@/components/results/groups/EmptyState'
import Groups from '@/components/results/groups/Groups'
import Organisation from '@/components/results/groups/Organisation'
import { throwNextError } from '@/helpers/server/error'
import { getGroups } from '@/helpers/server/model/groups'
import { getUserOrganisation } from '@/helpers/server/model/organisations'
import { getAuthUser } from '@/helpers/server/model/user'

export default async function GroupsDashboard() {
  const user = await throwNextError(getAuthUser)
  const [organisation, groups] = await Promise.all([
    getUserOrganisation(),
    getGroups({ user }),
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
