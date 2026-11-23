import type { Simulation } from '@/helpers/server/model/simulations'
import type { UpdateCurrentSimulationProps } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { isSimulationCompleted } from '@nosgestesclimat/core/features/simulations/helpers/simulation-guards'
import { useEffect, useMemo } from 'react'

interface Props {
  categories: DottedName[]
  remainingQuestions: DottedName[]
  relevantQuestions: DottedName[]
  updateCurrentSimulation: (simulation: UpdateCurrentSimulationProps) => void
  /** Absent when there is no persisted simulation yet. */
  currentStoredStatus: Pick<Simulation, 'status'> | undefined
}

/**
 * Derives the lifecycle status from the answered questions and stores it on the
 * simulation.
 */
export default function useSimulationStatus({
  remainingQuestions,
  relevantQuestions,
  updateCurrentSimulation,
  currentStoredStatus,
}: Props) {
  const completion = useMemo(
    () =>
      relevantQuestions.length
        ? (relevantQuestions.length - remainingQuestions.length) /
          relevantQuestions.length
        : 0,
    [relevantQuestions, remainingQuestions]
  )

  useEffect(() => {
    const status: Simulation['status'] =
      completion === 1
        ? 'full_result_seen'
        : completion === 0
          ? 'not_started'
          : 'answering_major_questions'

    // Never retrograde a simulation which is already completed
    if (
      currentStoredStatus &&
      isSimulationCompleted(currentStoredStatus) &&
      !isSimulationCompleted({ status })
    )
      return

    updateCurrentSimulation({ status })
  }, [completion, updateCurrentSimulation, currentStoredStatus])
}
