'use server'

import { ORGANISATION_URL, SIMULATION_URL } from '@/constants/urls/main'
import { InternalError } from '@/helpers/server/error'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { Simulation } from '@/helpers/server/model/simulations'
import { withUserSession } from '@/services/auth/with-user-session'
import { updateGroupParticipant } from '@/services/groups/update-group-participant'
import { setExtra } from '@sentry/nextjs'
import { ensureSimulationModel } from './ensure-simulation-model'

export const saveSimulation = async ({
  simulation: incomingSimulation,
  name,
  locale,
}: {
  simulation: Simulation
  name?: string
  locale?: string
}): Promise<Simulation> => {
  if (incomingSimulation.computedResults.carbone.bilan === 0) {
    setExtra('situation', JSON.stringify(incomingSimulation.situation))
    setExtra('simulationId', incomingSimulation.id)
    throw new InternalError('Simulation with zero bilan cannot be saved.')
  }

  // Guard every branch below at once
  const simulation = await ensureSimulationModel(incomingSimulation)

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
    return await withUserSession(async (session) => {
      const pollId = polls.at(-1)!.id
      const params = locale ? `?locale=${locale}` : ''

      return await fetchServer<Simulation>(
        `${ORGANISATION_URL}/public-polls/${pollId}/simulations${params}`,
        {
          method: 'POST',
          body: simulation,
          session,
        }
      )
    })
  }

  return await withUserSession(
    async (session) =>
      await fetchServer<Simulation>(SIMULATION_URL, {
        method: 'POST',
        body: simulation,
        session,
      })
  )
}
