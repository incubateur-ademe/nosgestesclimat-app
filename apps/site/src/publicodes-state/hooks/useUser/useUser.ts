'use client'

import { useCallback, useContext } from 'react'
import userContext from '../../providers/userProvider/context'
import type { User } from '../../types'
import useActions from './hooks/useActions'
import useTutorials from './hooks/useTutorials'
import useUpdateCurrentSimulation from './hooks/useUpdateCurrentSimulation'

/**
 * A hook to get and set every info about a user
 */
export default function useUser() {
  const { user, setUser, tutorials, setTutorials, simulation, setSimulation } =
    useContext(userContext)

  const updateName = useCallback(
    (name: string) =>
      setUser((prevUser: User | null) => prevUser && { ...prevUser, name }),
    [setUser]
  )

  const updateCurrentSimulation = useUpdateCurrentSimulation({ setSimulation })

  const { toggleActionChoice, rejectAction } = useActions({
    currentSimulation: simulation,
    updateCurrentSimulation,
  })

  const { hideTutorial, showTutorial } = useTutorials({ setTutorials })

  return {
    /**
     * All the information about the user (for now: name, email, region and north star rating)
     */
    user,
    /**
     * A setter for updating the user
     */
    setUser,
    /**
     * A setter for updating the user name (not used for now)
     */
    updateName,
    /**
     * A list of all tutorials seen by the user (that we do not need to show)
     */
    tutorials,
    /**
     * Set a tutorial to not seen (it should be displayed)
     */
    showTutorial,
    /**
     * Set a tutorial to seen (it should not be displayed)
     */
    hideTutorial,
    /**
     * The user's simulation, or `undefined` until one has been persisted
     * server-side. Simulations are created by server actions only.
     */
    simulation,
    /**
     * A setter for the simulation (used to clear it, e.g. on logout)
     */
    setSimulation,
    /**
     * Update the current simulation — a no-op when there is none
     */
    updateCurrentSimulation,
    /**
     * Toggle the action choice of the current simulation
     */
    toggleActionChoice,
    /**
     * Reject the action choice of the current simulation
     */
    rejectAction,
  }
}
