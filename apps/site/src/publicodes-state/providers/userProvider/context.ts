'use client'

import type { Simulation } from '@/helpers/server/model/simulations'
import type { Dispatch, SetStateAction } from 'react'
import { createContext } from 'react'
import type { Tutorials, User } from '../../types'

interface UserContextType {
  user: User | null
  setUser: Dispatch<SetStateAction<User | null>>
  tutorials: Tutorials
  setTutorials: Dispatch<SetStateAction<Tutorials>>
  simulation: Simulation | undefined
  setSimulation: Dispatch<SetStateAction<Simulation | undefined>>
}

export default createContext<UserContextType>({
  user: null,
  setUser: () => {},
  tutorials: {},
  setTutorials: () => {},
  simulation: undefined,
  setSimulation: () => {},
})
