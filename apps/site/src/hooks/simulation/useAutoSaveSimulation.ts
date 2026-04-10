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
  useEffect(() => {
    debouncedSaveSimulation({ simulation: currentSimulation })

    return () => {
      debouncedSaveSimulation.cancel()
    }
  }, [currentSimulation.situation])
}
