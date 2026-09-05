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
 *
 * remainingQuestionsByCategories is not really usefull. It is not deleted for now because it is used in the actions page
 */
export default function useProgression({
  categories,
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

  const remainingQuestionsByCategories = useMemo(
    () =>
      categories.reduce(
        (accumulator, currentValue) => ({
          ...accumulator,
          [currentValue]: remainingQuestions.filter((question) =>
            question.includes(currentValue)
          ),
        }),
        {} as Record<DottedName, DottedName[]>
      ),
    [remainingQuestions, categories]
  )

  // Updates the progression stored in the user object / hook
  useEffect(() => {
    // Never retrograde a simulation which is already completed
    if (currentStoredProgression === 1 && progression < 1) return

    updateCurrentSimulation({ progression })
  }, [progression, updateCurrentSimulation, currentStoredProgression])

  return {
    remainingQuestionsByCategories,
    /**
     * Fresh at render time, unlike `simulation.progression` which the effect
     * above only catches up with on the next commit.
     */
    progression: currentStoredProgression === 1 ? 1 : progression,
  }
}
