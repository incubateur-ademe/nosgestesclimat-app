import { randomUUID } from 'node:crypto'
import type { BackgroundTaskRunner } from '../../../lib/background-task-runner.ts'
import type { Result } from '../../../lib/result.ts'
import { failure, success } from '../../../lib/result.ts'
import { runSideEffect } from '../../../lib/run-side-effect.ts'
import { transaction } from '../../../lib/transaction.ts'
import type { AppUser } from '../../auth/types/user-session.ts'
import type { SendEmail } from '../../emails/types.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import type { Logger } from '../../logger/index.ts'
import { createSendPollJoinedEmail } from '../../simulations/emails/simulation-emails.ts'
import { SimulationNotFoundError } from '../../simulations/errors/simulations.error.ts'
import { newSimulation } from '../../simulations/helpers/new-simulation.ts'
import { isSimulationCompleted } from '../../simulations/helpers/simulation-guards.ts'
import { findSimulationProgressById } from '../../simulations/repository/simulation-progress.repository.ts'
import { createSimulation } from '../../simulations/repository/simulation.repository.ts'
import type { Model } from '../../simulations/types/model.ts'
import {
  type ParticipateToPollError,
  PollNotFoundError,
} from '../errors/polls.error.ts'
import {
  createPollParticipation,
  findUserPollParticipations,
} from '../repositories/poll-participation.repository.ts'
import { findPollById } from '../repositories/poll.repository.ts'
import { enqueuePollStatsComputation } from '../stats/services/enqueue-poll-stats-computation.ts'

interface ParticipateToPollDependencies {
  logger: Logger
  sendEmail: SendEmail
  /** Public origin the emails link back to */
  origin: string
  /** Runs the email outside of the request lifecycle */
  backgroundTaskRunner: BackgroundTaskRunner
}

type ParticipateToPollParams = {
  userSession: AppUser
  pollId: string
  locale: ISOSupportedLanguage
} & (
  | { reuseSimulationId: string; model?: never }
  | { reuseSimulationId?: never; model: Model }
)

export function createParticipateToPoll({
  logger: _logger,
  sendEmail,
  origin,
  backgroundTaskRunner,
}: ParticipateToPollDependencies) {
  const sendPollJoinedEmail = createSendPollJoinedEmail(sendEmail)

  /** Enters a user in a poll with an existing or fresh simulation. Reusing
   * adds membership only — the simulation stays as answered. */
  return async function participateToPoll({
    userSession,
    pollId,
    locale,
    reuseSimulationId,
    model,
  }: ParticipateToPollParams): Promise<
    Result<{ simulationId: string }, ParticipateToPollError>
  > {
    const logger = _logger.child({ pollId })
    const userId = userSession.id

    const [poll, participations, reusedSimulation] = await Promise.all([
      findPollById(pollId),
      findUserPollParticipations({ pollId, userId }),
      reuseSimulationId
        ? findSimulationProgressById({ id: reuseSimulationId, userId })
        : null,
    ])

    if (!poll) return failure(new PollNotFoundError())
    // `findSimulationProgressById` filters on the owner, so an unknown id and
    // somebody else's simulation are the same answer.
    if (reuseSimulationId && !reusedSimulation) {
      return failure(new SimulationNotFoundError())
    }

    // Joining twice is joining once: the membership is already there and the
    // email already went out. Only a reused simulation can already have a
    // membership — a fresh id is generated below and cannot match.
    if (
      reusedSimulation?.id &&
      participations.some((p) => p.simulationId === reusedSimulation.id)
    ) {
      return success({ simulationId: reusedSimulation.id })
    }

    const isNewParticipation = participations.length === 0

    const simulationId = reuseSimulationId ?? randomUUID()

    const result = await transaction(async (tx) => {
      if (reuseSimulationId === undefined) {
        await createSimulation(
          newSimulation({ id: simulationId, userId, model }),
          tx
        )
      }

      await createPollParticipation({ pollId, simulationId }, tx)

      // An already completed simulation is already counted in the poll totals,
      // so entering it changes them.
      if (reusedSimulation && isSimulationCompleted(reusedSimulation)) {
        await enqueuePollStatsComputation(pollId, tx)
      }
    })
    if (!result.success) return result

    /** Only already-completed simulations need the email here; incomplete ones
     * get it from `completeSimulation`. */
    if (
      userSession.isAuth &&
      isNewParticipation &&
      reusedSimulation &&
      isSimulationCompleted(reusedSimulation)
    ) {
      runSideEffect(
        'pollJoinedEmail',
        {
          logger: logger.child({ simulationId }),
          backgroundTaskRunner,
        },
        () =>
          sendPollJoinedEmail({
            email: userSession.email,
            organisation: poll.organisation,
            poll,
            simulationId,
            locale,
            origin,
          })
      )
    }

    return success({ simulationId })
  }
}
