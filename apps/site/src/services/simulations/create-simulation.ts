'use server'

import { SIMULATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import { stringifyModel, type Model } from '@/helpers/server/model/models'
import type { Simulation } from '@/helpers/server/model/simulations'
import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import { withUserId } from '@/services/auth/with-user-id'

export const createSimulation = async (model: Model) =>
  withUserId(async (userId) => {
    const simulation = generateSimulation({ model: stringifyModel(model) })
    return fetchServer<Simulation>(`${SIMULATION_URL}/${userId}`, {
      method: 'POST',
      body: simulation,
    })
  })
