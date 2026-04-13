import { TEST_INTRO_TUTO_KEY } from '@/app/[locale]/(simulation)/(large)/tutoriel/_components/ButtonStart'
import type { useUser } from '@/publicodes-state'
import type { Simulation } from '@/publicodes-state/types'
import type { CookieState } from '@/services/tracking/cookieStateStore'
import posthog from 'posthog-js'
import { getUserSimulations } from '../server/model/simulations'
import { generateSimulation } from '../simulation/generateSimulation'
import { postSimulation } from '../simulation/postSimulation'
import { sanitizeSimulation } from '../simulation/sanitizeSimulation'

// This is the date when we started to save all simulations started on the server
const LIMIT_DATE = new Date('2025-11-27')

async function uploadLocalSimulations({
  simulations,
  userId,
}: {
  simulations: Simulation[]
  userId: string
}): Promise<boolean> {
  const simulationsToUpload = simulations.filter(
    (simulation) => new Date(simulation.date) < LIMIT_DATE
  )

  if (simulationsToUpload.length === 0) return false

  const results = await Promise.allSettled(
    simulationsToUpload.map((simulation) =>
      postSimulation({
        simulation: sanitizeSimulation(simulation),
        userId,
      })
    )
  )

  return results.some((result) => result.status === 'fulfilled')
}

async function loadServerSimulation({
  updateSimulations,
  setCurrentSimulationId,
  hideTutorial,
}: {
  updateSimulations: (simulations: Simulation[]) => void
  setCurrentSimulationId: (simulationId: string) => void
  hideTutorial: (tutorialId: string) => void
}) {
  // Fetch simulations from server
  let simulations = await getUserSimulations()

  if (simulations.length === 0) {
    simulations = [generateSimulation()]
  } else {
    hideTutorial(TEST_INTRO_TUTO_KEY)
  }
  setCurrentSimulationId(simulations[0].id)
  updateSimulations(simulations)
}

export async function reconcileUserOnAuth({
  userId,
  email,
  user,
  cookieState,
}: {
  userId: string
  email: string
  user: ReturnType<typeof useUser>
  cookieState: CookieState
}) {
  let hasMigratedSimulations = false
  const {
    user: localUser,
    updateSimulations,
    simulations,
    updateEmail,
    updateUserId,
    setCurrentSimulationId,
    hideTutorial,
  } = user

  if (userId === localUser.userId) {
    // We only sync if localuserId is the same as distant userId
    hasMigratedSimulations = await uploadLocalSimulations({
      simulations,
      userId,
    })
  }

  await loadServerSimulation({
    updateSimulations,
    setCurrentSimulationId,
    hideTutorial,
  })

  updateEmail(email)
  updateUserId(userId)

  // We identify the user to posthog after the reconciliation

  if (cookieState.posthog === 'accepted') {
    posthog.identify(userId)
  }

  return hasMigratedSimulations
}
