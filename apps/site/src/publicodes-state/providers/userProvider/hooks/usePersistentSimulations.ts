import { STORAGE_KEY } from '@/constants/storage'
import type { Simulation } from '@/helpers/server/model/simulations'
import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import type { Migration } from '@publicodes/tools/migration'
import { useEffect, useMemo, useState } from 'react'

interface Props {
  migrationInstructions: Migration
  serverSimulations?: Simulation[]
}

export default function usePersistentSimulations({
  migrationInstructions,
  serverSimulations,
}: Props) {
  const [initSimulations, initCurrentSimulationId] = useMemo(() => {
    const parsedStorage = getCurrentStorage()
    let initSimulations: Simulation[] = parsedStorage.simulations
    if (serverSimulations?.length) {
      // Merge existing localStorage simulations with server simulations
      // (using server simulations when conflicts occur)
      initSimulations = Object.values(
        Object.groupBy(
          [...serverSimulations, ...initSimulations],
          (simulation) => simulation.id
        )
      ).map((simulations) => simulations![0])
    }
    if (!initSimulations.length) {
      initSimulations = [generateSimulation()]
    }
    initSimulations = initSimulations.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    const initCurrentSimulationId: string | undefined = initSimulations[0].id

    // Migrate the current simulation
    initSimulations[0] = generateSimulation({
      ...initSimulations[0],
      migrationInstructions,
    })

    return [initSimulations, initCurrentSimulationId] as const
  }, [migrationInstructions, serverSimulations])

  const [simulations, setSimulations] = useState<Simulation[]>(initSimulations)
  const [currentSimulationId, setCurrentSimulationId] = useState<string>(
    initCurrentSimulationId
  )

  useEffect(() => {
    saveSimulations(simulations)
  }, [simulations])

  useEffect(() => {
    saveCurrentSimulationId(currentSimulationId)
  }, [currentSimulationId])

  return {
    simulations,
    setSimulations,
    currentSimulationId,
    setCurrentSimulationId,
  }
}

function getCurrentStorage(): {
  simulations: Simulation[]
  currentSimulationId: string
} {
  return (
    JSON.parse(safeLocalStorage.getItem(STORAGE_KEY) ?? 'null') ?? {
      simulations: [],
      currentSimulationId: '',
    }
  )
}

function saveSimulations(simulations: Simulation[]) {
  const storage = getCurrentStorage()
  const updatedStorage = {
    ...storage,
    simulations,
  }
  safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStorage))
}

function saveCurrentSimulationId(currentSimulationId: string) {
  const storage = getCurrentStorage()
  const updatedStorage = {
    ...storage,
    currentSimulationId,
  }
  safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStorage))
}
