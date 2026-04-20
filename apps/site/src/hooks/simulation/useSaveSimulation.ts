import type { Simulation } from '@/helpers/server/model/simulations'
import { saveSimulation } from '@/helpers/simulation/saveSimulation'
import { useUser } from '@/publicodes-state'
import { useMutation } from '@tanstack/react-query'
import { useLocale } from '../useLocale'

export function useSaveSimulation() {
  const {
    user: { userId, name },
  } = useUser()
  const locale = useLocale()

  const { mutateAsync, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: async ({ simulation }: { simulation: Simulation }) =>
      saveSimulation({ simulation, userId, name, locale }),
  })

  return {
    saveSimulation: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
  }
}
