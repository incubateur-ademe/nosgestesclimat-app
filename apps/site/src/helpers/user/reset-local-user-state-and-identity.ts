import { STORAGE_KEY } from '@/constants/storage'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { User } from '@/publicodes-state/types'
import { PostHog } from '@/services/tracking/Posthog'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'

const posthog = new PostHog()

interface Props {
  setUser: (user: User | null) => void
  setSimulation: (simulation: Simulation | undefined) => void
}

/**
 * Clears the locally held user (e.g. on logout). The simulation is server-owned, so it
 * is dropped rather than replaced — the next render resolves it from the server.
 */
export function resetLocalUserStateAndIdentity({
  setUser,
  setSimulation,
}: Props) {
  safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify({}))
  setUser(null)
  setSimulation(undefined)

  posthog.resetIdentity()
}
