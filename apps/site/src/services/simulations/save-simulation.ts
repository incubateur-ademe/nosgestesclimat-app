'use server'

import { ORGANISATION_URL, SIMULATION_URL } from '@/constants/urls/main'
import { InternalError } from '@/helpers/server/error'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { Simulation } from '@/helpers/server/model/simulations'
import { withUserId } from '@/services/auth/with-user-id'
import { updateGroupParticipant } from '@/services/groups/update-group-participant'

export const saveSimulation = async ({
  simulation,
  name,
  locale,
}: {
  simulation: Simulation
  name?: string
  locale?: string
}): Promise<Simulation> => {
  if (simulation.computedResults.carbone.bilan === 0) {
    throw new InternalError()
  }

  const { groups = [], polls = [] } = simulation

  if (groups.length) {
    await updateGroupParticipant({
      groupId: groups.at(-1)!.id,
      simulation,
      name,
    })

    return simulation
  }

  if (polls.length) {
    return await withUserId(async (userId) => {
      const pollId = polls.at(-1)!.id
      const params = locale ? `?locale=${locale}` : ''

      return await fetchServer<Simulation>(
        `${ORGANISATION_URL}/${userId}/public-polls/${pollId}/simulations${params}`,
        {
          method: 'POST',
          body: simulation,
        }
      )
    })
  }

  return await withUserId(
    async (userId) =>
      await fetchServer<Simulation>(`${SIMULATION_URL}/${userId}`, {
        method: 'POST',
        body: simulation,
      })
  )
}
