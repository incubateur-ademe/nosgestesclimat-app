'use client'

import { useSaveSimulation } from '@/hooks/simulation/useSaveSimulation'
import { useCurrentSimulation } from '@/publicodes-state'
import { useEffect, useRef } from 'react'

// Delay before saving to avoid too many requests when multiple actions are selected quickly
const SAVE_DELAY = 500

// Auto save the simulation when actionChoices change
export default function ActionAutoSave() {
  const currentSimulation = useCurrentSimulation()
  const { saveSimulation } = useSaveSimulation()

  // Track previous actionChoices to detect changes (using a serialized string for comparison)
  const prevActionChoicesRef = useRef<string>('')
  const prevSimulationIdRef = useRef<string>('')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip if no simulation
    if (!currentSimulation) return

    const currentActionChoices = currentSimulation.actionChoices || {}
    const currentActionChoicesString = JSON.stringify(currentActionChoices)

    // If simulation ID changed, reset tracking
    if (prevSimulationIdRef.current !== currentSimulation.id) {
      prevSimulationIdRef.current = currentSimulation.id
      prevActionChoicesRef.current = currentActionChoicesString
      isFirstRender.current = true
      // Clear any pending timeout for the old simulation
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    // On first render for this simulation, just store the initial state without saving
    if (isFirstRender.current) {
      prevActionChoicesRef.current = currentActionChoicesString
      isFirstRender.current = false
      return
    }

    // Check if actionChoices have actually changed
    if (currentActionChoicesString !== prevActionChoicesRef.current) {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Save after a short delay to batch rapid changes
      timeoutRef.current = setTimeout(() => {
        saveSimulation({
          simulation: currentSimulation,
        })
        prevActionChoicesRef.current = JSON.stringify(
          currentSimulation.actionChoices || {}
        )
      }, SAVE_DELAY)
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [currentSimulation, saveSimulation])

  // Return null as this component doesn't render anything
  return null
}
