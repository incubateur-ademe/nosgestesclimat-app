'use server'

import { SIMULATION_URL } from '@/constants/urls/main'
import { UnauthorizedError } from '@/helpers/server/error'
import { fetchServer } from '@/helpers/server/fetchServer'
import {
  getSimulationMode,
  type Simulation,
  type SimulationMode,
} from '@/helpers/server/model/simulations'
import { getUserSession } from '@/services/auth/get-user-session'

/**
 * Invisibly replaces the completed simulations of the current session whose
 * mode differs from the poll being joined.
 *
 * On a shared computer (e.g. in a school), an anonymous session may still hold
 * the previous user's completed test. Joining a poll whose mode differs must
 * not leak that previous user's results: the conflicting completed simulations
 * are soft-deleted so the participant starts fresh. Same-mode simulations are
 * left untouched.
 */
export const replaceCompletedSimulationsForPoll = async (
  mode: SimulationMode
) => {
  const session = await getUserSession()
  if (!session) throw new UnauthorizedError()

  const simulations = await fetchServer<Simulation[]>(
    `${SIMULATION_URL}?completedOnly=true&pageSize=50`
  )

  const simulationsToDelete = simulations.filter(
    (simulation) => getSimulationMode(simulation) !== mode
  )

  await Promise.allSettled(
    simulationsToDelete.map((simulation) =>
      fetchServer(`${SIMULATION_URL}/${simulation.id}`, {
        method: 'DELETE',
      })
    )
  )
}
