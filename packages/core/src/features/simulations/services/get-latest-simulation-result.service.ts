import { migrateSimulationIfNeeded } from '../helpers/migrate-simulation.ts'
import { findCompletedSimulations } from '../repository/simulation.repository.ts'
import type { Simulation } from '../types/simulation.ts'
import {
  findSimulationResultGroup,
  type SimulationResult,
  type Tendency,
} from './get-simulation-result.service.ts'

export const getLatestSimulationResult = async ({
  userId,
  withTendency,
}: {
  userId: string
  withTendency: boolean
}): Promise<SimulationResult | null> => {
  const limit = withTendency ? 2 : 1
  const simulations = await findCompletedSimulations({ userId, limit })

  const rawSimulation = simulations[0] ?? null
  if (!rawSimulation) return null

  const simulation = migrateSimulationIfNeeded(rawSimulation)

  const rawPreviousSimulation = simulations[1] ?? null
  const previousSimulation: Simulation | null = rawPreviousSimulation
    ? migrateSimulationIfNeeded(rawPreviousSimulation)
    : null

  const group = await findSimulationResultGroup(simulation)

  const tendency =
    withTendency && previousSimulation
      ? computeTendency(
          previousSimulation.computedResults.carbone.bilan,
          simulation.computedResults.carbone.bilan
        )
      : null

  return {
    simulation,
    group,
    tendency,
  }
}

const computeTendency = (
  previousValue: number,
  currentValue: number
): Tendency => {
  return previousValue < currentValue ? 'increase' : 'decrease'
}
