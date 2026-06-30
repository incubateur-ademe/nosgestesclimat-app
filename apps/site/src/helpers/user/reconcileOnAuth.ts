import { STORAGE_KEY } from '@/constants/storage'
import type { Simulation } from '@/helpers/server/model/simulations'
import { uploadLocalSimulations } from '@/services/simulations/upload-local-simulations'
import type { CookieState } from '@/services/tracking/cookieStateStore'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import posthog from 'posthog-js'
import { sanitizeSimulation } from '../simulation/sanitizeSimulation'

const LIMIT_DATE = new Date('2025-11-27')

async function uploadHistoricalSimulations() {
  const storage = JSON.parse(safeLocalStorage.getItem(STORAGE_KEY) || '{}')
  const simulations = ((storage?.simulations ?? []) as Simulation[])
    .filter((simulation) => new Date(simulation.date) < LIMIT_DATE)
    .map((simulation) => sanitizeSimulation(simulation))

  if (simulations.length === 0) return

  return uploadLocalSimulations(simulations)
}

export async function reconcileUserOnAuth({
  cookieState,
  userId,
}: {
  userId: string
  cookieState: CookieState
}) {
  await uploadHistoricalSimulations()

  if (cookieState.posthog === 'accepted') {
    posthog.identify(userId)
  }
}
