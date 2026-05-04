'use client'

import {
  getSimulationMode,
  type Simulation,
} from '@/helpers/server/model/simulations'
import posthog from 'posthog-js'
import { useEffect } from 'react'

export default function CurrentSimulationTracker({
  currentSimulation,
}: {
  currentSimulation: Simulation
}) {
  useEffect(() => {
    posthog.register({
      current_simulation_mode: getSimulationMode(currentSimulation),
    })
  }, [currentSimulation])
  return null
}
