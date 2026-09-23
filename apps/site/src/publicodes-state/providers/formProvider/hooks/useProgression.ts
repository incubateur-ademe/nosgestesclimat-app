import type { UpdateCurrentSimulationProps } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useEffect, useMemo } from 'react'

interface Props {
  categories: DottedName[]
  remainingQuestions: DottedName[]
  relevantQuestions: DottedName[]
  updateCurrentSimulation: (simulation: UpdateCurrentSimulationProps) => void
  /** Absent when there is no persisted simulation yet. */
  currentStoredProgression: number | undefined
}

/**
 * Get progression and remaining questions sorted by category
 */
export default function useProgression({
  remainingQuestions,
  relevantQuestions,
  updateCurrentSimulation,
  currentStoredProgression,
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
    // Never retrograde a simulation which is already completed
    if (currentStoredProgression === 1 && progression < 1) return

    updateCurrentSimulation({ progression })
  }, [progression, updateCurrentSimulation, currentStoredProgression])
}
