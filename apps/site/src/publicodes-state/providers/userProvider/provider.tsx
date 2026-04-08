'use client'

import { useState, type PropsWithChildren } from 'react'

import type { Simulation } from '@/helpers/server/model/simulations'
import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import migrationInstructions from '@incubateur-ademe/nosgestesclimat/public/migration.json'
import UserContext from './context'
import { useMigrateAnonSession } from './hooks/useMigrateAnonSession'
import usePersistentTutorials from './hooks/usePersistentTutorials'
import usePersistentUser from './hooks/usePersistentUser'

interface Props {
  /**
   * The localstorage key in use
   */
  storageKey?: string
  serverSimulations?: Simulation[]
  serverUserId: string
}
export default function UserProvider({
  children,
  serverSimulations,
  serverUserId,
}: PropsWithChildren<Props>) {
  const { user, setUser } = usePersistentUser({
    serverUserId,
  })

  const { tutorials, setTutorials } = usePersistentTutorials()

  // One-shot migration: seeds the server's encrypted session with the
  // client's localStorage userId.  Can be removed once all active users
  // have visited the site at least once after deployment.
  useMigrateAnonSession({
    serverUserId,
    currentUserId: user.userId,
  })

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
