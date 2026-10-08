'use server'

import { GROUP_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { Simulation } from '@/helpers/server/model/simulations'
import logger from '@/logger/logger.server'
import { buildNewSimulationPayload } from '@/services/simulations/build-new-simulation-payload'
import { ensureSimulationModel } from '@/services/simulations/ensure-simulation-model'
import { getCurrentSimulation } from '@/services/simulations/get-current-simulation'
import { withUserSession } from '../auth/with-user-session'

/** Adds the connected user to a group or updates their simulation.
 * Revalidating the group results page is left to the caller. */
export const updateGroupParticipant = async ({
  groupId,
  simulation,
  name = '',
}: {
  groupId: string
  /**
   * The simulation to take part with. Omit it to let the user's current
   * simulation be resolved server-side — only the caller holding fresher
   * answers than the API (the simulator saving its progress) needs to pass one.
   */
  simulation?: Simulation
  name?: string
}) =>
  await logger.withSpan(
    'site.action.updateGroupParticipant',
    async (logger) =>
      await withUserSession(async (session) => {
        // Falling straight through to a new simulation would strand a user who
        // joins mid-test: their in-progress answers would stay behind, unlinked,
        // and the empty simulation built here would become the current one.
        const participantSimulation =
          simulation ?? (await getCurrentSimulation())

        return await fetchServer(`${GROUP_URL}/${groupId}/participants`, {
          method: 'POST',
          body: {
            simulation: participantSimulation
              ? await ensureSimulationModel(participantSimulation, logger)
              : await buildNewSimulationPayload(),
            name,
          },
          session,
        })
      })
  )
