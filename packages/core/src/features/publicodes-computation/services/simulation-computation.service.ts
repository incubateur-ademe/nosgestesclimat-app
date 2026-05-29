import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type Engine from 'publicodes'
import { assessActions } from '../../actions/services/assess-actions.service.ts'
import type { Simulation } from '../../simulations/types/simulation.ts'

/**
 * Computes all data derived from a simulation in a single engine pass.
 *
 * `setSituation` is called once — all subsequent evaluate() calls
 * benefit from the publicodes internal cache.
 */
export const computeDerivedSimulationData = async (
  engine: Engine<DottedName>,
  simulation: Simulation
): Promise<void> => {
  const newEngine = engine.shallowCopy().setSituation(simulation.situation)
  await assessActions(newEngine, simulation.id)
}
