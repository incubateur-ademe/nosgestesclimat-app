'use client'

import type { Simulation } from '@/helpers/server/model/simulations'
import type { Migration } from '@publicodes/tools/migration'
import type { Dispatch, SetStateAction } from 'react'
import { createContext } from 'react'
import type { Tutorials, User } from '../../types'

interface UserContextType {
  user: User
  setUser: Dispatch<SetStateAction<User>>
  tutorials: Tutorials
  setTutorials: Dispatch<SetStateAction<Tutorials>>
  simulations: Simulation[]
  setSimulations: Dispatch<SetStateAction<Simulation[]>>
  currentSimulationId: string
  setCurrentSimulationId: Dispatch<SetStateAction<string>>
  migrationInstructions: Migration
  isInitialized: boolean
}

export default createContext<UserContextType>({
  user: {
    region: {
      code: '',
      name: '',
    },
    initialRegion: {
      code: '',
      name: '',
    },
    name: '',
    email: '',
    userId: '',
    administratorEmail: '',
  },
  setUser: () => {},
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
  isInitialized: false,
})
