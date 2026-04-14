import EmptyState from '@/components/results/groups/EmptyState'
import Groups from '@/components/results/groups/Groups'
import Organisation from '@/components/results/groups/Organisation'
import { getUser } from '@/helpers/server/dal/user'
import { getGroups } from '@/helpers/server/model/groups'
import { getUserOrganisation } from '@/helpers/server/model/organisations'

export default async function GroupsDashboard() {
  const user = await getUser()
  const [organisation, groups] = await Promise.all([
    user.isAuth ? getUserOrganisation() : undefined,
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
