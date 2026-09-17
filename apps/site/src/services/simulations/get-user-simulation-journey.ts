'use server'

import { getUserSession } from '@/services/auth/get-user-session'
import { getUserSimulationJourney as getUserSimulationJourneyService } from '@nosgestesclimat/core/features/simulations/services/get-user-simulation-journey.service'
import type { UserSimulationJourney } from '@nosgestesclimat/core/features/simulations/types/simulation-progress'

export const getUserSimulationJourney =
  async (): Promise<UserSimulationJourney> => {
    const session = await getUserSession()
    if (!session) {
      return { currentSimulation: undefined, completedSimulation: undefined }
    }
    return await getUserSimulationJourneyService({ userId: session.id })
  }
