import { useUser } from '@/publicodes-state'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export const useInitSimulationParam = () => {
  const searchParams = useSearchParams()

  const { simulations, initSimulation } = useUser()

  const [isInit, setIsInit] = useState(false)
  useEffect(() => {
    // This is a shitty hack to avoid calling initSimulation before we get the simulations from the localStorage
    if (!simulations.length) {
      return
    }
    // This is another shitty hack because initSimulation is redifined on every simulation change...
    if (isInit) {
      return
    }
    setIsInit(true)

    const shouldInitSimulation = searchParams.get('newsimulation')
      ? true
      : false

    if (shouldInitSimulation) {
      initSimulation()
    }
  }, [searchParams, initSimulation, isInit, simulations])
}
