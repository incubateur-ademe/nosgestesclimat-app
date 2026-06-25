'use server'

import { SIMULATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import { stringifyModel, type Model } from '@/helpers/server/model/models'
import type { Simulation } from '@/helpers/server/model/simulations'
import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import { withUserId } from '@/services/auth/with-user-id'

export const createSimulation = async (model: Model) =>
  await withUserId(async () => {
    const simulation = generateSimulation({ model: stringifyModel(model) })
    return await fetchServer<Simulation>(SIMULATION_URL, {
      method: 'POST',
      body: simulation,
    })
  })
