'use client'

import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { STORAGE_KEY } from '@/constants/storage'
import { getGeolocation } from '@/helpers/api/getGeolocation'
import { Simulation } from '@/helpers/server/model/simulations'
import type { RegionFromGeolocation } from '@/publicodes-state/types'
import migrationInstructions from '@incubateur-ademe/nosgestesclimat/public/migration.json'
import UserContext from './context'
import { useMigrateAnonSession } from './hooks/useMigrateAnonSession'
import useUpdateOldLocalStorage from './hooks/useOldLocalStorage'
import usePersistentSimulations from './hooks/usePersistentSimulations'
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
  const [initialRegion, setInitialRegion] = useState<
    RegionFromGeolocation | undefined
  >(undefined)

  useEffect(() => {
    getGeolocation().then((region) => {
      setInitialRegion(region)
    })
  }, [])

  useUpdateOldLocalStorage({ storageKey: STORAGE_KEY })

  const { user, setUser } = usePersistentUser({
    initialRegion,
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

  const {
    simulations,
    setSimulations,
    currentSimulationId,
    setCurrentSimulationId,
  } = usePersistentSimulations({
    migrationInstructions,
    serverSimulations,
  })

  const isInitialized = useMemo(
    () => user && !!simulations.length,
    [user, simulations]
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
        isInitialized,
      }}>
      {children}
    </UserContext.Provider>
  )
}
