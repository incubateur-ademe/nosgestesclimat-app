'use server'

import { getSimulationResult as getSimulationResultService } from '@nosgestesclimat/core/features/simulations/services/get-simulation-result.service'

import type { SimulationResult } from '@/helpers/server/model/simulationResult'
import { getUserSession } from '@/services/auth/get-user-session'
import { notFound } from 'next/navigation'
import { toSimulationDto } from './simulation.dto'

export const getSimulationResult = async (
  id: string
): Promise<SimulationResult> => {
  const session = await getUserSession()
  if (!session) notFound()

  const result = await getSimulationResultService({
    id,
    userId: session.id,
  })

  if (!result) notFound()

  return {
    ...result,
    simulation: toSimulationDto(result.simulation),
  }
}
