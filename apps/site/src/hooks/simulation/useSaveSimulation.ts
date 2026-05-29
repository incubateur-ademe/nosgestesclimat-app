import { saveSimulationAction } from '@/app/[locale]/simulateur/(simulator-flow)/(root)/bilan/_actions/saveSimulationAction'
import type { Simulation } from '@/helpers/server/model/simulations'
import { getComputedResults } from '@/publicodes-state/helpers/getComputedResults'
import { EngineContext } from '@/publicodes-state/providers/engineProvider/context'
import { useMutation } from '@tanstack/react-query'
import { useContext } from 'react'

export function useSaveSimulation() {
  const engineContext = useContext(EngineContext)
  const { mutateAsync, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: async ({ simulation }: { simulation: Simulation }) => {
      simulation.computedResults = getComputedResults(engineContext)
      return saveSimulationAction(simulation)
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
