'use server'

import { getLatestSimulationResult as getLatestSimulationResultService } from '@nosgestesclimat/core/features/simulations/services/get-latest-simulation-result.service'

import type { SimulationResult } from '@/helpers/server/model/simulationResult'
import logger from '@/logger/logger.server'
import { getUserSession } from '@/services/auth/get-user-session'
import type { Logger } from '@nosgestesclimat/core/features/logger/index'
import { notFound } from 'next/navigation'

import { toSimulationDto } from './simulation.dto'

export const getLatestSimulationResult = logger.withSpan(
  'site.action.getLatestSimulationResult',
  async ({
    withTendency,
    logger: coreLogger,
  }: {
    withTendency: boolean
    logger: Logger
  }): Promise<SimulationResult> => {
    const session = await getUserSession()
    if (!session) notFound()

    const result = await getLatestSimulationResultService({
      withTendency,
      userId: session.id,
      logger: coreLogger,
    })

    if (!result) notFound()

    return {
      ...result,
      simulation: toSimulationDto(result.simulation),
    }
  }
)
