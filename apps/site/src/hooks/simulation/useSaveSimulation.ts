import type { Simulation } from '@/helpers/server/model/simulations'
import { useUser } from '@/publicodes-state'
import { getComputedResults } from '@/publicodes-state/helpers/getComputedResults'
import { EngineContext } from '@/publicodes-state/providers/engineProvider/context'
import { saveSimulation } from '@/services/simulations/save-simulation'
import { useMutation } from '@tanstack/react-query'
import { useContext } from 'react'
import { useLocale } from '../useLocale'

export function useSaveSimulation() {
  const { user } = useUser()
  const locale = useLocale()
  const engineContext = useContext(EngineContext)
  const { mutateAsync, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: async ({ simulation }: { simulation: Simulation }) => {
      simulation.computedResults = getComputedResults(engineContext)
      return await saveSimulation({ simulation, name: user?.name, locale })
    },
  })

  return {
    saveSimulation: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
  }
}
