import { randomUUID } from 'node:crypto'
import type { BackgroundTaskRunner } from '../../../lib/background-task-runner.ts'
import type { Result } from '../../../lib/result.ts'
import { failure, success } from '../../../lib/result.ts'
import { transaction } from '../../../lib/transaction.ts'
import type { AppUser } from '../../auth/types/user-session.ts'
import type { SendEmail } from '../../emails/types.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import type { CaptureException, Logger } from '../../logger/index.ts'
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

interface ParticipateToPollDependencies {
  logger: Logger
  captureException: CaptureException
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
  logger,
  captureException,
  sendEmail,
  origin,
  backgroundTaskRunner,
}: ParticipateToPollDependencies) {
  const sendPollJoinedEmail = createSendPollJoinedEmail(sendEmail)

  /**
   * Enters a user in a poll, either with a simulation they already completed
   * or with a fresh one they are about to answer.
   *
   * Reusing does not copy anything: the simulation stays as it was answered
   * and only gains a membership, so the poll and the user's own results always
   * show the same figures.
   */
  return async function participateToPoll(
    params: ParticipateToPollParams
  ): Promise<Result<{ simulationId: string }, ParticipateToPollError>> {
    const { userSession, pollId, locale, reuseSimulationId } = params
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

    const simulationId = params.reuseSimulationId ?? randomUUID()

    const result = await transaction(async (tx) => {
      if (params.reuseSimulationId === undefined) {
        await createSimulation(
          newSimulation({ id: simulationId, userId, model: params.model }),
          tx
        )
      }

      await createPollParticipation({ pollId, simulationId }, tx)
    })
    if (!result.success) return result

    /**
     * A simulation that still has to be answered gets its email when it is
     * completed - `completeSimulation` sends it. Only an already completed
     * simulation has nothing left to trigger it, so this is where the user
     * learns they joined.
     */
    if (
      userSession.isAuth &&
      isNewParticipation &&
      reusedSimulation &&
      isSimulationCompleted(reusedSimulation)
    ) {
      backgroundTaskRunner(async () => {
        const sent = await sendPollJoinedEmail({
          email: userSession.email,
          organisation: poll.organisation,
          poll,
          simulationId,
          locale,
          origin,
        })

        if (!sent.success) {
          captureException(sent.error)
          logger.error('Failed to send poll joined email', {
            error: sent.error,
            pollId,
            simulationId,
          })
        }
      })
    }

    return success({ simulationId })
  }
}
