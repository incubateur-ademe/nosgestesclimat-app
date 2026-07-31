'use server'

import { SIMULATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import { stringifyModel, type Model } from '@/helpers/server/model/models'
import type { Simulation } from '@/helpers/server/model/simulations'
import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import { withUserSession } from '@/services/auth/with-user-session'

export const createSimulation = async (model: Model) =>
  await withUserSession(async (session) => {
    const simulation = generateSimulation({ model: stringifyModel(model) })
    return await fetchServer<Simulation>(SIMULATION_URL, {
      method: 'POST',
      body: simulation,
      session,
    })
  })
