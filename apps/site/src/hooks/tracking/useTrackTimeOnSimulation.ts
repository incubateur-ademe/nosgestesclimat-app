import { useCallback, useState } from 'react'

export function useTrackTimeOnSimulation() {
  const [startTime] = useState(() => Date.now())

  const trackTimeOnSimulation = useCallback(() => {
    const endTime = Date.now()
    const timeSpentOnSimulation = endTime - startTime

    return timeSpentOnSimulation
  }, [startTime])

  return { trackTimeOnSimulation }
}
