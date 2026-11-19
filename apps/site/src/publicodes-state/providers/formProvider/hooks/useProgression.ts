import type { Simulation } from '@/helpers/server/model/simulations'
import type { UpdateCurrentSimulationProps } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { isSimulationCompleted } from '@nosgestesclimat/core/features/simulations/helpers/simulation-guards'
import { simulationStatusFromProgression } from '@nosgestesclimat/core/features/simulations/helpers/simulation-status'
import { useEffect, useMemo } from 'react'

interface Props {
  categories: DottedName[]
  remainingQuestions: DottedName[]
  relevantQuestions: DottedName[]
  updateCurrentSimulation: (simulation: UpdateCurrentSimulationProps) => void
  /** Absent when there is no persisted simulation yet. */
  currentStored: Pick<Simulation, 'progression' | 'status'> | undefined
}

/**
 * Get progression and remaining questions sorted by category
 */
export default function useProgression({
  remainingQuestions,
  relevantQuestions,
  updateCurrentSimulation,
  currentStored,
}: Props) {
  const progression = useMemo(
    () =>
      relevantQuestions.length
        ? (relevantQuestions.length - remainingQuestions.length) /
          relevantQuestions.length
        : 0,
    [relevantQuestions, remainingQuestions]
  )

  // Updates the progression stored in the user object / hook
  useEffect(() => {
    const status = simulationStatusFromProgression(progression)

    // Never retrograde a simulation which is already completed
    if (
      currentStored &&
      isSimulationCompleted(currentStored) &&
      !isSimulationCompleted({ status })
    )
      return

    updateCurrentSimulation({ progression, status })
  }, [progression, updateCurrentSimulation, currentStored])
}
