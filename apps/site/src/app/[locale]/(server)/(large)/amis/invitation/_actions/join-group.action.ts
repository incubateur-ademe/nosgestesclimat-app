'use server'

import {
  GROUP_RESULTS_ROUTE_PATTERN,
  TUTORIAL_PATH,
} from '@/constants/urls/paths'
import { getLinkToGroupDashboard } from '@/helpers/navigation/groupPages'
import type { Simulation } from '@/helpers/server/model/simulations'
import { isSimulationCompleted } from '@nosgestesclimat/core/features/simulations/helpers/simulation-guards'
import { revalidatePath } from 'next/cache'
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
  // The joiner may hold a cached results page for this group — the invitation
  // screen they were served before taking part.
  revalidatePath(GROUP_RESULTS_ROUTE_PATTERN, 'page')

  if (simulation && isSimulationCompleted(simulation)) {
    redirect(getLinkToGroupDashboard({ groupId }))
  } else {
    redirect(TUTORIAL_PATH)
  }
}
