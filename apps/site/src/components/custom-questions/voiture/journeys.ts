import type { Journey } from '@/types/journey'

export const periods: Record<string, number> = {
  day: 365,
  week: 52,
  month: 12,
  year: 1,
}

export function roundFloat(value: number, precision = 10): number {
  return Math.round(value * precision) / precision
}

/** Total annualised km across the journeys. Pure. */
export function computeTotal(journeys: Journey[]): number {
  const rawTotal = journeys.reduce(
    (accumulator, currentValue) =>
      accumulator +
      currentValue.distance *
        currentValue.reccurrence *
        periods[currentValue.period],
    0
  )
  return roundFloat(rawTotal)
}

/** Distance-weighted average passengers. Pure. */
export function computeAveragePassengers(
  journeys: Journey[],
  total: number
): number {
  if (!total) return 1
  const rawAveragePassengers =
    journeys.reduce(
      (accumulator, currentValue) =>
        accumulator +
        currentValue.passengers *
          currentValue.distance *
          currentValue.reccurrence *
          periods[currentValue.period],
      0
    ) / total
  return roundFloat(rawAveragePassengers)
}

export function computeTotalForOnePassenger(
  journeys: Journey[],
  total: number,
  averagePassengers: number
): number {
  return journeys.length ? roundFloat(total / averagePassengers) : 0
}
