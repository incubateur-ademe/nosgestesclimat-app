import type { Logger } from '../../logger/index.ts'
import { SimulationNotFinishedException } from '../exceptions/simulation-computation.exception.ts'
import { isModelSupported } from '../model-support/is-model-supported.ts'
import { createSimulationComputation } from '../repositories/simulation-computations.repository.ts'
import { getSimulationById } from '../repositories/simulation.repository.ts'

interface ProgramSimulationComputationDeps {
  logger: Logger
}

export function createProgramSimulationComputation(
  deps: ProgramSimulationComputationDeps
) {
  return async function programSimulationComputation(
    simulationId: string
  ): Promise<void> {
    const logger = deps.logger.child({
      component: 'core.service.programSimulationComputation',
      simulationId,
    })
    const simulation = await getSimulationById(simulationId)

    if (simulation.progression !== 1) {
      throw new SimulationNotFinishedException({
        simulationId: simulation.id,
        progression: simulation.progression,
      })
    }

    if (!isModelSupported(simulation.model)) {
      // The computation is skipped: the simulation stays pending, nothing is lost.
      logger.warn('Unsupported model', {
        code: 'unsupported_model',
        model: simulation.model,
      })
      return
    }

    const result = await createSimulationComputation(simulationId)
    if (!result.success) {
      logger.warn(result.error)
    }
  }
}
