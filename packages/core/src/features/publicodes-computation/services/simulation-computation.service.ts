import type Engine from 'publicodes'
import { assessActions } from '../../actions/services/assess-actions.service.ts'
import { findSimulationById } from '../repositories/simulation.repository.ts'

/**
 * Computes all data derived from a simulation in a single engine pass.
 *
 * `setSituation` is called once — all subsequent evaluate() calls
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

  await assessActions(engine, simulationId)
}
