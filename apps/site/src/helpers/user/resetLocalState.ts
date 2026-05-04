import { STORAGE_KEY } from '@/constants/storage'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { User } from '@/publicodes-state/types'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import { generateSimulation } from '../simulation/generateSimulation'

interface Props {
  setUser: (user: User) => void
  updateSimulations: (simulations: Simulation[]) => void
}

export function resetLocalState({ setUser, updateSimulations }: Props) {
  const defaultSimulation = generateSimulation()

  const resettedUser = {
    userId: '',
  }

  safeLocalStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      user: resettedUser,
    })
  )

  setUser(resettedUser)
  updateSimulations([defaultSimulation])
}
