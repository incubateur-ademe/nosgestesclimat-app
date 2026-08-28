'use server'

import { getCurrentSimulation as getCurrentSimulationService } from '@nosgestesclimat/core/features/simulations/services/get-current-simulation.service'

import { migrateSimulationIfNeeded } from '@/helpers/server/model/models'
import type { Simulation } from '@/helpers/server/model/simulations'
import { getUserSession } from '@/services/auth/get-user-session'
import { toSimulationDto } from './simulation.dto'

export const getCurrentSimulation = async (): Promise<
  Simulation | undefined
> => {
  const session = await getUserSession()
  if (!session) return undefined

  const simulation = await getCurrentSimulationService({ userId: session.id })
  if (!simulation) return undefined

  return migrateSimulationIfNeeded(toSimulationDto(simulation))
}
