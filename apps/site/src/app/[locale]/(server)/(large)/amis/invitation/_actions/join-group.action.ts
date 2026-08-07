'use server'

import { TUTORIAL_PATH } from '@/constants/urls/paths'
import { getLinkToGroupDashboard } from '@/helpers/navigation/groupPages'
import type { Simulation } from '@/helpers/server/model/simulations'
import { redirect } from 'next/navigation'

import { updateGroupParticipant } from '@/services/groups/update-group-participant'

/**
 * Adds the visitor to the group then navigates. The redirect is issued
 * server-side (via `redirect()`) so that the navigation does not depend on a
 * client-side `router.push` after a server action, which can be dropped once
 * the transition settles (observed with `cacheComponents`).
 */
export const joinGroup = async ({
  groupId,
  simulation,
  name,
}: {
  groupId: string
  simulation?: Simulation
  name?: string
}) => {
  await updateGroupParticipant({ groupId, simulation, name })

  if (simulation?.progression === 1) {
    redirect(getLinkToGroupDashboard({ groupId }))
  } else {
    redirect(TUTORIAL_PATH)
  }
}
