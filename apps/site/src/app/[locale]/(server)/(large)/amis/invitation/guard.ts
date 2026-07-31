import { getLinkToGroupDashboard } from '@/helpers/navigation/groupPages'
import { throwNextError } from '@/helpers/server/error'
import { getGroup } from '@/helpers/server/model/groups'
import { getUserSession } from '@/services/auth/get-user-session'
import type { Group } from '@/types/groups'
import { notFound, redirect } from 'next/navigation'

interface GroupInvitationGuardReturn {
  group: Group
}

/**
 * Validates access to the group results page:
 * - Checks that `groupId` is present in search params
 * - Fetches the group and the current user
 * - Checks that the user has a simulation in the group (otherwise redirects to invitation)
 */
export async function groupInvitationGuard(
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | undefined
): Promise<GroupInvitationGuardReturn> {
  if (!searchParams) {
    notFound()
  }

  const searchParamsObject = await searchParams
  const groupId = searchParamsObject.groupId

  if (typeof groupId !== 'string' || !groupId) {
    notFound()
  }

  const user = await getUserSession()
  const group = await throwNextError(() => getGroup({ groupId }))
  const userSimulation =
    user &&
    group.participants.find((participant) => participant.userId === user.id)
      ?.simulation
  if (userSimulation) {
    redirect(getLinkToGroupDashboard({ group }))
  }
  return { group }
}
