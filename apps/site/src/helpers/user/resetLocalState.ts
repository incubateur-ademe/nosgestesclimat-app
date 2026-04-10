import type { Simulation, User } from '@/publicodes-state/types'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import { getGeolocation } from '../api/getGeolocation'
import { generateSimulation } from '../simulation/generateSimulation'

interface Props {
  setUser: (user: User) => void
  updateSimulations: (simulations: Simulation[]) => void
}

export async function resetLocalState({ setUser, updateSimulations }: Props) {
  const initialRegion = await getGeolocation()

  const defaultSimulation = generateSimulation()

  const resettedUser = {
    region: initialRegion,
    initialRegion: initialRegion,
    userId: '',
  }

  safeLocalStorage.setItem(
    'nosgestesclimat::v3',
    JSON.stringify({
      user: resettedUser,
      simulations: [defaultSimulation],
      currentSimulationId: defaultSimulation.id,
    })
  )

  setUser(resettedUser)
  updateSimulations([defaultSimulation])
}
