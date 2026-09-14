'use server'

import { getPollParticipation as getPollParticipationService } from '@nosgestesclimat/core/features/simulations/services/get-poll-participation.service'

import type { Simulation } from '@/helpers/server/model/simulations'
import { getUserSession } from '@/services/auth/get-user-session'
import { toSimulationDto } from './simulation.dto'

export const getPollParticipation = async (
  pollIdOrSlug: string
): Promise<Simulation | undefined> => {
  const session = await getUserSession()
  if (!session) return undefined

  const simulation = await getPollParticipationService({
    userId: session.id,
    pollIdOrSlug,
  })
  if (!simulation) return undefined

  return toSimulationDto(simulation)
}
