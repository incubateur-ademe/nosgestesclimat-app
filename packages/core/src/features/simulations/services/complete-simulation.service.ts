import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { RunInBackground } from '../../../lib/background-task.ts'
import type { Result } from '../../../lib/result.ts'
import { failure, success } from '../../../lib/result.ts'
import type { AddOrUpdateContact, SendEmail } from '../../emails/types.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import type { CaptureException, Logger } from '../../logger/index.ts'
import {
  type CompleteSimulationError,
  SimulationCompletedError,
  SimulationIncompleteError,
  SimulationNotFoundError,
  ZeroFootprintError,
} from '../errors/simulations.error.ts'
import { isSimulationCompleted } from '../helpers/simulation-guards.ts'
import { findSimulationById } from '../repository/simulation.repository.ts'
import type { ComputedResults } from '../validators/computed-results.schema.ts'

interface CompleteSimulationDependencies {
  logger: Logger
  captureException: CaptureException
  addOrUpdateContact: AddOrUpdateContact
  sendEmail: SendEmail
  /** Public origin the emails link back to */
  origin: string
  /** Runs the post-completion side effects outside of the request lifecycle */
  runInBackground: RunInBackground
}

export function createCompleteSimulation(_: CompleteSimulationDependencies) {
  return async function completeSimulation({
    userId,
    simulationId,
    progression,
    computedResults,
    locale: ____,
  }: {
    userId: string
    simulationId: string
    progression: number
    situation: Situation<DottedName>
    foldedSteps: DottedName[]
    computedResults: ComputedResults
    locale: ISOSupportedLanguage
  }): Promise<Result<void, CompleteSimulationError>> {
    if (progression !== 1) return failure(new SimulationIncompleteError())
    if (computedResults.carbone.bilan === 0) {
      return failure(new ZeroFootprintError())
    }

    const simulation = await findSimulationById({ id: simulationId, userId })
    if (!simulation) return failure(new SimulationNotFoundError())
    if (isSimulationCompleted(simulation))
      return failure(new SimulationCompletedError())

    // FIXME: implement

    return success()
  }
}
