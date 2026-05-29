import type { Tendency } from '../types/simulation-result.ts'

export const getTendency = ({
  previousValue,
  currentValue,
}: {
  previousValue?: number
  currentValue: number
}): Tendency | undefined => {
  if (!previousValue || previousValue === currentValue) {
    return undefined
  }

  if (previousValue < currentValue) return 'increase'
  return 'decrease'
}
