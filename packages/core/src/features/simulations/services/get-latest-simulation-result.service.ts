import type { Logger } from '../../logger/index.ts'
import { migrateSimulationIfNeeded } from '../helpers/migrate-simulation.ts'
import { findCompletedSimulations } from '../repository/simulation.repository.ts'
import type { Simulation } from '../types/simulation.ts'
import type { ComputedResults } from '../validators/computed-results.schema.ts'
import {
  findSimulationResultGroup,
  type SimulationResult,
  type Tendency,
} from './get-simulation-result.service.ts'
import { createResolveComputedResults } from './resolve-computed-results.service.ts'

/**
 * Returns the user's latest completed simulation with its `computedResults`
 * resolved from its rule evaluations — the value the results page displays and
 * the tendency compares. The previous simulation is loaded and resolved too
 * when `withTendency` is set, so the tendency compares the same resolved
 * `carbone.bilan` values that are displayed.
 */
export const getLatestSimulationResult = async ({
  userId,
  withTendency,
  logger,
}: {
  userId: string
  withTendency: boolean
  logger: Logger
}): Promise<SimulationResult | null> => {
  const resolveComputedResults = createResolveComputedResults({ logger })

  const limit = withTendency ? 2 : 1
  const simulations = await findCompletedSimulations({ userId, limit })

  const rawSimulation = simulations[0] ?? null
  if (!rawSimulation) return null

  const simulation = await resolveSimulation(rawSimulation, {
    resolveComputedResults,
  })

  const rawPreviousSimulation = simulations[1] ?? null
  const previousSimulation: Simulation | null = rawPreviousSimulation
    ? await resolveSimulation(rawPreviousSimulation, { resolveComputedResults })
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

/** Migrates a simulation, then resolves its `computedResults` from its rule
 * evaluations: the value the caller displays and compares. */
const resolveSimulation = async (
  rawSimulation: Simulation,
  {
    resolveComputedResults,
  }: {
    resolveComputedResults: (simulation: Simulation) => Promise<ComputedResults>
  }
): Promise<Simulation> => {
  const simulation = migrateSimulationIfNeeded(rawSimulation)
  return {
    ...simulation,
    computedResults: await resolveComputedResults(simulation),
  }
}

const computeTendency = (
  previousValue: number,
  currentValue: number
): Tendency => {
  return previousValue < currentValue ? 'increase' : 'decrease'
}
