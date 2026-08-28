'use server'

import { getUserSession } from '@/services/auth/get-user-session'
import { getUserSimulationProgress as getUserSimulationProgressService } from '@nosgestesclimat/core/features/simulations/services/get-user-simulation-progress.service'
import type { UserSimulationProgress } from '@nosgestesclimat/core/features/simulations/types/simulation-progress'

export const getUserSimulationProgress =
  async (): Promise<UserSimulationProgress> => {
    const session = await getUserSession()
    if (!session) {
      return { currentSimulation: undefined, completedSimulation: undefined }
    }
    return await getUserSimulationProgressService({ userId: session.id })
  }
