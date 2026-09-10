'use server'

import { getLatestSimulationResult as getLatestSimulationResultService } from '@nosgestesclimat/core/features/simulations/services/get-latest-simulation-result.service'

import type { SimulationResult } from '@/helpers/server/model/simulationResult'
import { getUserSession } from '@/services/auth/get-user-session'
import { notFound } from 'next/navigation'
import { toSimulationDto } from './simulation.dto'

export const getLatestSimulationResult = async ({
  withTendency,
}: {
  withTendency: boolean
}): Promise<SimulationResult> => {
  const session = await getUserSession()
  if (!session) notFound()

  const result = await getLatestSimulationResultService({
    withTendency,
    userId: session.id,
  })

  if (!result) notFound()

  return {
    ...result,
    simulation: toSimulationDto(result.simulation),
  }
}
