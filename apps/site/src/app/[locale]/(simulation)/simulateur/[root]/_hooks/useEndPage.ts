import { useCurrentSimulation, useUser } from '@/publicodes-state'
import { useTransition } from 'react'
import { endTestAction } from '../_actions/endTestAction'

export function useEndTest() {
  const currentSimulation = useCurrentSimulation()
  const { user } = useUser()
  const [isPending, startTransition] = useTransition()

  return {
    isPending,
    endTest: () =>
      currentSimulation.progression === 1 &&
      startTransition(() => endTestAction(currentSimulation, user.name)),
  }
}
