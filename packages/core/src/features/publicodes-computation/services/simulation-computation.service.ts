import type Engine from 'publicodes'
import { findSimulationById } from '../repositories/simulation.repository.ts'
import { computeActionAssessments } from '../../actions/services/compute-action-assessments.service.ts'

/**
 * Computes all data derived from a simulation in a single engine pass.
 *
 * The caller is responsible for providing an already-shallowCopied engine
 * instance. `setSituation` is called once — all subsequent evaluate() calls
 * benefit from the publicodes internal cache.
 */
export const computeDerivedSimulationData = async (
  engine: Engine,
  simulationId: string
): Promise<void> => {
  const simulation = await findSimulationById(simulationId)

  engine.setSituation(
    simulation.situation as Parameters<typeof engine.setSituation>[0]
  )

  await computeActionAssessments(engine, simulationId)

  // Future: await computeCategoryStats(engine, simulationId)
  // Future: await computeRecommendations(engine, simulationId)
}
