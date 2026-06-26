'use server'

import type { Simulation } from '@/helpers/server/model/simulations'
import { getSimulations } from './get-simulations'

export const getCurrentSimulation = async (): Promise<
  Simulation | undefined
> => {
  const simulations = await getSimulations({ pageSize: 1 })
  return simulations.at(0)
}
