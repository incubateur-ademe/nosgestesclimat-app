export type Tendency = 'increase' | 'decrease'

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
