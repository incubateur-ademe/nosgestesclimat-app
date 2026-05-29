import { NoCompletedSimulationForUserException } from '../exceptions/simulation-result.exception.ts'
import { getTendency } from '../helpers/get-tendency.ts'
import { findLatestSimulationResults } from '../repositories/simulation-result.repository.ts'
import type { SimulationResult } from '../types/simulation-result.ts'

export const getSimulationResult = async (
  userId: string,
  options?: { withTendency?: boolean }
): Promise<SimulationResult> => {
  const results = await findLatestSimulationResults(
    userId,
    options?.withTendency ? 2 : 1
  )

  const latest = results.at(0)
  if (!latest) {
    throw new NoCompletedSimulationForUserException({ userId })
  }
  const previous = results.at(1)
  return {
    ...latest,
    hasPreviousResult: !!previous,
    tendency: previous
      ? getTendency({
          previousValue: previous.computedResults.carbone.bilan,
          currentValue: latest.computedResults.carbone.bilan,
        })
      : undefined,
  }
}
