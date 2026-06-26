'use client'

import { useState, type PropsWithChildren } from 'react'

import type { Simulation } from '@/helpers/server/model/simulations'
import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import type { UserSession } from '@/services/auth/get-user-session'
import migrationInstructions from '@incubateur-ademe/nosgestesclimat/public/migration.json'
import UserContext from './context'
import usePersistentPendingVerification from './hooks/usePersistentPendingVerification'
import usePersistentTutorials from './hooks/usePersistentTutorials'
import usePersistentUser from './hooks/usePersistentUser'

interface Props {
  /**
   * The localstorage key in use
   */
  storageKey?: string
  serverSimulations?: Simulation[]
  userSession: UserSession
}
export default function UserProvider({
  children,
  serverSimulations,
  userSession,
}: PropsWithChildren<Props>) {
  const { user, setUser } = usePersistentUser(userSession)

  const { pendingVerification, setPendingVerification } =
    usePersistentPendingVerification()

  const { tutorials, setTutorials } = usePersistentTutorials()

  const initSimulation = serverSimulations?.at(0)
    ? serverSimulations
    : [generateSimulation()]
  const [simulations, setSimulations] = useState(initSimulation)
  const [currentSimulationId, setCurrentSimulationId] = useState(
    initSimulation.at(0)!.id
  )

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        pendingVerification,
        setPendingVerification,
        tutorials,
        setTutorials,
        simulations,
        setSimulations,
        currentSimulationId,
        setCurrentSimulationId,
        migrationInstructions,
      }}>
      {children}
    </UserContext.Provider>
  )
}
