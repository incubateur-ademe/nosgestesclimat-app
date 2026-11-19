import type { UpdateCurrentSimulationProps } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useEffect, useMemo } from 'react'

interface Props {
  remainingQuestions: DottedName[]
  relevantQuestions: DottedName[]
  updateCurrentSimulation: (simulation: UpdateCurrentSimulationProps) => void
  /** Absent when there is no persisted simulation yet. */
  currentStoredProgression: number | undefined
}

/** Writes how far the form has advanced into the simulation. */
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

  useEffect(() => {
    // A completed simulation is terminal: its progression never goes back down.
    if (currentStoredProgression === 1 && progression < 1) return
    if (progression === currentStoredProgression) return

    updateCurrentSimulation({ progression })
  }, [progression, updateCurrentSimulation, currentStoredProgression])
}
