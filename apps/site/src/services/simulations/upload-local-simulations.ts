'use server'

import { SIMULATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { Simulation } from '@/helpers/server/model/simulations'
import { getUserSession } from '@/services/auth/get-user-session'

/**
 * Uploads simulations found in localStorage on first authentication.
 *
 * These predate the `model` field entirely (see `LIMIT_DATE` in
 * `reconcileOnAuth`), so `ensureSimulationModel` is deliberately NOT applied
 * here: stamping them with a current model would claim they were computed with
 * rules they never ran against. They are stored with the database default
 * instead, which is truthful and keeps them out of the computation queue.
 */
export const uploadLocalSimulations = async (simulations: Simulation[]) => {
  const session = await getUserSession()
  if (!session) return

  return await Promise.allSettled(
    simulations.map((simulation) =>
      fetchServer(SIMULATION_URL, {
        method: 'POST',
        body: simulation,
      })
    )
  )
}
