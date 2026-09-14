import { getLinkToGroupInvitation } from '@/helpers/navigation/groupPages'
import { throwNextError } from '@/helpers/server/error'
import { getGroup } from '@/helpers/server/model/groups'
import type { Simulation } from '@/helpers/server/model/simulations'
import { getUserSession } from '@/services/auth/get-user-session'
import type { Group } from '@/types/groups'
import type { AppUser } from '@nosgestesclimat/core/features/auth/types/user-session'
import { notFound, redirect } from 'next/navigation'
import { findOwnParticipant } from '../_helpers/findOwnParticipant'

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
 * - Checks that the user takes part in the group (otherwise redirects to
 *   invitation)
 *
 * Takes its decision from {@link findOwnParticipant}, the same predicate the
 * invitation page guards on, so the two pages cannot redirect to one another
 * indefinitely.
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

  const ownParticipant = findOwnParticipant(group, user.id)

  if (!ownParticipant) {
    redirect(getLinkToGroupInvitation({ group }))
  }

  return { group, user, userSimulation: ownParticipant.simulation, groupId }
}
