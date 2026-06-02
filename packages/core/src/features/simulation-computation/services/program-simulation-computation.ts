import pkg from '@incubateur-ademe/nosgestesclimat/package.json' with { type: 'json' }
import { log } from '../../logger/index.ts'
import { getSimulationById } from '../../simulations/repository/simulation.repository.ts'
import {
  SimulationNotFinished,
  UnsupportedModel,
} from '../exceptions/simulation-computation.exception.ts'
import { createSimulationComputation } from '../repositories/simulation-computations.repository.ts'
export const programSimulationComputation = async (
  simulationId: string
): Promise<void> => {
  const simulation = await getSimulationById(simulationId)

  if (simulation.progression !== 1) {
    throw new SimulationNotFinished({
      simulationId: simulation.id,
      progression: simulation.progression,
    })
  }

  const model = simulation.model
  if (
    model.locale !== 'fr' ||
    model.region !== 'FR' ||
    'PRNumber' in model.version ||
    model.version.publishedTag !== pkg.version
  ) {
    log(new UnsupportedModel({ model: simulation.model }))
    return
  }

  await createSimulationComputation(simulationId)
}
