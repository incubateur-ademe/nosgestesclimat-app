import { useCurrentSimulation, useFormState, useRule } from '@/publicodes-state'
import type { Metrics } from '@incubateur-ademe/nosgestesclimat'
import { useEffect, useRef, useState } from 'react'

export function useGetDifference({ metric }: { metric: Metrics }): {
  difference: number
  updateKey: number
} {
  const { numericValue } = useRule('bilan', metric)

  const [difference, setDifference] = useState(0)
  const [countValueUpdate, setCountValueUpdate] = useState(0)
  // We need this value to force the component to re-render when the numericValue changes
  // We don't use numericValue directly because it update before the displayDifference
  const [keyFromNumericValue, setKeyFromNumericValue] = useState(numericValue)
  const [hasAlreadyAnswered, setHasAlreadyAnswered] = useState<
    boolean | undefined
  >()

  const { foldedSteps, situation } = useCurrentSimulation()

  const { currentQuestion } = useFormState()

  const { type } = useRule(currentQuestion!)

  const prevValue = useRef(numericValue)
  const prevQuestion = useRef(currentQuestion)

  // Reset component state upon question change
  useEffect(() => {
    if (prevQuestion.current !== currentQuestion) {
      setDifference(0)
      setHasAlreadyAnswered(undefined)
      setCountValueUpdate(0)
    }
  }, [currentQuestion])

  // Dynamically set hasAlreadyAnswered when user visits question he/she has already answered
  useEffect(() => {
    const isInFoldedSteps = !!(
      foldedSteps &&
      currentQuestion &&
      foldedSteps.includes(currentQuestion)
    )

    // This is set only once, at mount or when the question changes,
    // after getting the foldedSteps from the local state
    if (typeof hasAlreadyAnswered === 'undefined') {
      setHasAlreadyAnswered(isInFoldedSteps)
    }
  }, [currentQuestion, foldedSteps, hasAlreadyAnswered])

  // If user has already answered, show the value change upon next form interaction
  useEffect(() => {
    if (hasAlreadyAnswered && countValueUpdate === 0) {
      setCountValueUpdate(1)
    }
  }, [countValueUpdate, hasAlreadyAnswered, difference])

  // Calculate difference
  useEffect(() => {
    const updatedDifference = numericValue - prevValue.current

    setDifference(updatedDifference)

    setKeyFromNumericValue(numericValue)

    if (numericValue !== prevValue.current) {
      setCountValueUpdate((prevValue) => ++prevValue)
    }

    prevValue.current = numericValue
    // if the situation change but difference stay at 0, we wan't to hide previous live score. The `useEffect` is triggered but difference is 0.
  }, [numericValue, situation])

  // The question contains a number input
  // User hasn't updated twice his/her answer
  if (countValueUpdate <= 1 || type === 'numberMosaic' || type === 'number') {
    return {
      difference: 0,
      updateKey: keyFromNumericValue,
    }
  }

  return { difference, updateKey: keyFromNumericValue }
}
