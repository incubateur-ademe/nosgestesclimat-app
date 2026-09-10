'use client'

import { useState, type PropsWithChildren } from 'react'

import type { Simulation } from '@/helpers/server/model/simulations'
import type { UserSession } from '@nosgestesclimat/core/features/auth/types/user-session'
import UserContext from './context'
import usePersistentTutorials from './hooks/usePersistentTutorials'

interface Props {
  /**
   * The localstorage key in use
   */
  storageKey?: string
  /**
   * The user's current simulation, as persisted server-side. Absent when the
   * user has not taken the test yet — the client never fabricates one.
   */
  simulation?: Simulation
  userSession: UserSession
}
export default function UserProvider({
  children,
  simulation: serverSimulation,
  userSession,
}: PropsWithChildren<Props>) {
  const [user, setUser] = useState(userSession)

  const { tutorials, setTutorials } = usePersistentTutorials()

  const [simulation, setSimulation] = useState(serverSimulation)

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        tutorials,
        setTutorials,
        simulation,
        setSimulation,
      }}>
      {children}
    </UserContext.Provider>
  )
}
