import EmptyState from '@/components/results/groups/EmptyState'
import Groups from '@/components/results/groups/Groups'
import Organisation from '@/components/results/groups/Organisation'
import { getGroups } from '@/helpers/server/model/groups'
import { getUserOrganisation } from '@/helpers/server/model/organisations'
import { getUserSession } from '@/services/auth/get-user-session'
import { redirect } from 'next/navigation'

export default async function GroupsDashboard() {
  const user = await getUserSession()
  if (!user) {
    redirect('/')
  }

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
