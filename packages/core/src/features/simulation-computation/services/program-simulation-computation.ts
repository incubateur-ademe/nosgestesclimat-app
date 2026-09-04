import type { CaptureException, Logger } from '../../logger/index.ts'
import { UnsupportedModelError } from '../errors/simulation-computation.error.ts'
import { SimulationNotFinishedException } from '../exceptions/simulation-computation.exception.ts'
import { isModelSupported } from '../model-support/is-model-supported.ts'
import { createSimulationComputation } from '../repositories/simulation-computations.repository.ts'
import { getSimulationById } from '../repositories/simulation.repository.ts'

interface ProgramSimulationComputationDeps {
  logger: Logger
  captureException: CaptureException
}

export function createProgramSimulationComputation(
  deps: ProgramSimulationComputationDeps
) {
  return async function programSimulationComputation(
    simulationId: string
  ): Promise<void> {
    const { logger, captureException } = deps
    const simulation = await getSimulationById(simulationId)

    if (simulation.progression !== 1) {
      throw new SimulationNotFinishedException({
        simulationId: simulation.id,
        progression: simulation.progression,
      })
    }

    if (!isModelSupported(simulation.model)) {
      const exception = new UnsupportedModelError(simulation.model)
      logger.error(`[program-simulation-computation] ${exception.message}`, {
        model: exception.model,
      })
      captureException(exception)
      return
    }

    await createSimulationComputation(simulationId)
  }
}
