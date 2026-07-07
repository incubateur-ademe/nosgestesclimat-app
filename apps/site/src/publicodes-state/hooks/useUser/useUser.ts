'use client'

import type { PendingVerification } from '@/components/authentication/authenticateUserForm/_hooks/usePendingVerification'
import { useCallback, useContext } from 'react'
import userContext from '../../providers/userProvider/context'
import type { User } from '../../types'
import useActions from './hooks/useActions'
import useSimulations from './hooks/useSimulations'
import useTutorials from './hooks/useTutorials'

/**
 * A hook to get and set every info about a user
 */
export default function useUser() {
  const {
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
  } = useContext(userContext)

  const updateName = useCallback(
    (name: string) =>
      setUser((prevUser: User | null) => prevUser && { ...prevUser, name }),
    [setUser]
  )

  const updatePendingVerification = useCallback(
    (value: PendingVerification | undefined) =>
      setPendingVerification(value ?? null),
    [setPendingVerification]
  )

  const {
    initSimulation,
    deleteSimulation,
    currentSimulation,
    updateCurrentSimulation,
    updateSimulations,
  } = useSimulations({
    simulations,
    setSimulations,
    currentSimulationId,
    setCurrentSimulationId,
    migrationInstructions,
  })

  const { toggleActionChoice, rejectAction } = useActions({
    currentSimulation,
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
     * The pending verification state (email + expiration date), set when a verification code is sent
     */
    pendingVerification,
    /**
     * A setter for updating the user pending verification information
     */
    updatePendingVerification,
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
     * A list of every simulations of the user (and their associated informations)
     */
    simulations,
    /**
     * Delete a the specified simulation
     */
    deleteSimulation,
    /**
     * Return the current simulation ID (if there is one)
     */
    currentSimulationId,
    /**
     * Set the current simulation ID
     */
    setCurrentSimulationId,
    /**
     * Update the current simulation
     */
    updateCurrentSimulation,
    /**
     * The current simulation (or the first one of the list)
     */
    currentSimulation,
    /**
     * Create a new simulation (with the situation and the persona passed if applicable), set it as current and return its ID
     */
    initSimulation,
    /**
     * Update the list of simulations
     */
    updateSimulations,
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
