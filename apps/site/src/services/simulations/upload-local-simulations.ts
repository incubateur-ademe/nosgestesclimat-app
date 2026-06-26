'use server'

import { SIMULATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { Simulation } from '@/helpers/server/model/simulations'
import { getUserSession } from '@/services/auth/get-user-session'

export const uploadLocalSimulations = async (simulations: Simulation[]) => {
  const session = await getUserSession()
  if (!session) return

  return Promise.allSettled(
    simulations.map((simulation) =>
      fetchServer(`${SIMULATION_URL}/${session.id}`, {
        method: 'POST',
        body: simulation,
      })
    )
  )
}
