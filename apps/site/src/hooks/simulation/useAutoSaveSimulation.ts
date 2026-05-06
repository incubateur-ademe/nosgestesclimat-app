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
    5000
  )
  // Debounced save on every situation/foldedSteps change.
  // No cleanup needed: the debounce function internally clears stale
  // timeouts when a new call is made.
  useEffect(() => {
    debouncedSaveSimulation({ simulation: currentSimulation })
  }, [currentSimulation.situation, currentSimulation.foldedSteps])

  // Flush the pending save ONLY on unmount (empty deps = cleanup runs
  // exclusively when the component is removed from the tree).
  // This ensures the latest simulation state is persisted even when
  // navigating to an intercalaire page in scolaire mode.
  useEffect(() => {
    return () => {
      debouncedSaveSimulation.flush()
    }
  }, [])
}
