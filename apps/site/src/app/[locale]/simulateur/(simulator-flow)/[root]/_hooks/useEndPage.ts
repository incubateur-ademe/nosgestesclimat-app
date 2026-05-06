import { useCurrentSimulation, useUser } from '@/publicodes-state'
import { getComputedResults } from '@/publicodes-state/helpers/getComputedResults'
import { EngineContext } from '@/publicodes-state/providers/engineProvider/context'
import { useContext, useTransition } from 'react'
import { endTestAction } from '../_actions/endTestAction'

export function useEndTest() {
  const currentSimulation = useCurrentSimulation()
  const { user } = useUser()
  const [isPending, startTransition] = useTransition()
  const engineContext = useContext(EngineContext)

  return {
    isPending,
    endTest: () =>
      currentSimulation.progression === 1 &&
      startTransition(() => {
        const simulation = { ...currentSimulation }
        simulation.computedResults = getComputedResults(engineContext)
        void endTestAction(simulation, user.name)
      }),
  }
}
