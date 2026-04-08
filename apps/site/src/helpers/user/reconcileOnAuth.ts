import { STORAGE_KEY } from '@/constants/storage'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { useUser } from '@/publicodes-state'
import type { CookieState } from '@/services/tracking/cookieStateStore'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import posthog from 'posthog-js'
import { postSimulation } from '../simulation/postSimulation'
import { sanitizeSimulation } from '../simulation/sanitizeSimulation'

// This is the date when we started to save all simulations started on the server
const LIMIT_DATE = new Date('2025-11-27')

async function uploadLocalSimulations({ userId }: { userId: string }) {
  const storage = JSON.parse(safeLocalStorage.getItem(STORAGE_KEY) || '{}')
  return Promise.allSettled(
    ((storage?.simulations ?? []) as Simulation[])
      .filter((simulation) => new Date(simulation.date) < LIMIT_DATE)
      .map((simulation) =>
        postSimulation({
          simulation: sanitizeSimulation(simulation),
          userId,
        })
      )
  )
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
  const { user: localUser, updateEmail, updateUserId } = user

  if (userId === localUser.userId) {
    // We only sync if localuserId is the same as distant userId
    await uploadLocalSimulations({
      userId,
    })
  }

  updateEmail(email)
  updateUserId(userId)

  // We identify the user to posthog after the reconciliation

  if (cookieState.posthog === 'accepted') {
    posthog.identify(userId)
  }
}
