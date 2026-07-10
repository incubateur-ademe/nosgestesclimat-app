import { isFullSimulation } from '@/helpers/groups/isFullSimulation'
import { getLinkToGroupInvitation } from '@/helpers/navigation/groupPages'
import { throwNextError } from '@/helpers/server/error'
import { getGroup } from '@/helpers/server/model/groups'
import type { Simulation } from '@/helpers/server/model/simulations'
import { getUserSession, type AppUser } from '@/services/auth/get-user-session'
import type { Group } from '@/types/groups'
import { notFound, redirect } from 'next/navigation'

interface GroupResultsGuardReturn {
  group: Group
  user: AppUser
  userSimulation: Simulation
  groupId: string
}

/**
 * Validates access to the group results page:
 * - Checks that `groupId` is present in search params
 * - Fetches the group and the current user
 * - Checks that the user has a simulation in the group (otherwise redirects to invitation)
 */
export async function groupResultsGuard(
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | undefined
): Promise<GroupResultsGuardReturn> {
  if (!searchParams) {
    notFound()
  }

  const searchParamsObject = await searchParams
  const groupId = searchParamsObject.groupId

  if (typeof groupId !== 'string' || !groupId) {
    notFound()
  }

  const user = await getUserSession()
  if (!user) {
    redirect(getLinkToGroupInvitation({ groupId }))
  }

  const group = await throwNextError(() => getGroup({ groupId }))

  const ownSimulation = group.participants.find(
    (participant) => participant.userId === user.id
  )?.simulation

  const userSimulation =
    ownSimulation && isFullSimulation(ownSimulation) ? ownSimulation : undefined

  if (!userSimulation) {
    redirect(getLinkToGroupInvitation({ group }))
  }

  return { group, user, userSimulation, groupId }
}
