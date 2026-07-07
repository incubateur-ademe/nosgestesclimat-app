'use client'

import type { PendingVerification } from '@/components/authentication/authenticateUserForm/_hooks/usePendingVerification'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { Migration } from '@publicodes/tools/migration'
import type { Dispatch, SetStateAction } from 'react'
import { createContext } from 'react'
import type { Tutorials, User } from '../../types'

interface UserContextType {
  user: User | null
  setUser: Dispatch<SetStateAction<User | null>>
  pendingVerification: PendingVerification | null
  setPendingVerification: Dispatch<SetStateAction<PendingVerification | null>>
  tutorials: Tutorials
  setTutorials: Dispatch<SetStateAction<Tutorials>>
  simulations: Simulation[]
  setSimulations: Dispatch<SetStateAction<Simulation[]>>
  currentSimulationId: string
  setCurrentSimulationId: Dispatch<SetStateAction<string>>
  migrationInstructions: Migration
}

export default createContext<UserContextType>({
  user: null,
  setUser: () => {},
  pendingVerification: null,
  setPendingVerification: () => {},
  tutorials: {},
  setTutorials: () => {},
  simulations: [],
  setSimulations: () => {},
  currentSimulationId: '',
  setCurrentSimulationId: () => {},
  migrationInstructions: {
    keysToMigrate: {},
    valuesToMigrate: {},
  },
})
