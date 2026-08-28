'use server'

import { getLastCompletedSimulation as getLastCompletedSimulationService } from '@nosgestesclimat/core/features/simulations/services/get-last-completed-simulation.service'

import { migrateSimulationIfNeeded } from '@/helpers/server/model/models'
import type { Simulation } from '@/helpers/server/model/simulations'
import { getUserSession } from '@/services/auth/get-user-session'
import { toSimulationDto } from './simulation.dto'

export const getLastCompletedSimulation = async (): Promise<
  Simulation | undefined
> => {
  const session = await getUserSession()
  if (!session) return undefined

  const simulation = await getLastCompletedSimulationService({
    userId: session.id,
  })
  if (!simulation) return undefined

  return migrateSimulationIfNeeded(toSimulationDto(simulation))
}
