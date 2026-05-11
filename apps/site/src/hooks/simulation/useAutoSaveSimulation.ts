import { useCurrentSimulation } from '@/publicodes-state'
import { useDebounce } from '@/utils/debounce'
import { useEffect } from 'react'
import { useSaveSimulation } from './useSaveSimulation'

export function useAutoSaveSimulation() {
  const { saveSimulation } = useSaveSimulation()
  const currentSimulation = useCurrentSimulation()
  const debouncedSaveSimulation = useDebounce(
    async (props: Parameters<typeof saveSimulation>[0]) => {
      await saveSimulation(props)
    },
    2000
  )
  // Debounced save on every situation/foldedSteps change.
  // No cleanup needed: the debounce function internally clears stale
  // timeouts when a new call is made.
  useEffect(() => {
    debouncedSaveSimulation({ simulation: currentSimulation })
  }, [currentSimulation.situation, currentSimulation.foldedSteps])

  useEffect(() => {
    return () => {
      debouncedSaveSimulation.cancel()
    }
  }, [currentSimulation.situation, currentSimulation.foldedSteps])
}
