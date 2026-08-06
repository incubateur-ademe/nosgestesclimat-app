import { STORAGE_KEY } from '@/constants/storage'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { User } from '@/publicodes-state/types'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'

interface Props {
  setUser: (user: User | null) => void
  setSimulation: (simulation: Simulation | undefined) => void
}

/**
 * Clears the locally held user (e.g. on logout). The simulation is server-owned, so it
 * is dropped rather than replaced — the next render resolves it from the server.
 */
export function resetLocalState({ setUser, setSimulation }: Props) {
  const resettedUser = null

  safeLocalStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      user: resettedUser,
    })
  )

  setUser(resettedUser)
  setSimulation(undefined)
}
