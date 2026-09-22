import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { BackgroundTaskRunner } from '../../../lib/background-task-runner.ts'
import { invariant } from '../../../lib/invariant.ts'
import type { Result } from '../../../lib/result.ts'
import { failure, success } from '../../../lib/result.ts'
import { transaction } from '../../../lib/transaction.ts'
import type { AppUser } from '../../auth/types/user-session.ts'
import { Attributes } from '../../emails/email.constant.ts'
import type { AddOrUpdateContact, SendEmail } from '../../emails/types.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import { findGroupById } from '../../groups/repositories/group.repository.ts'
import type { CaptureException, Logger } from '../../logger/index.ts'
import { findPollById } from '../../polls/repositories/poll.repository.ts'
import { enqueuePollStatsComputation } from '../../polls/stats/services/enqueue-poll-stats-computation.ts'
import { UnsupportedModelError } from '../../simulation-computation/errors/simulation-computation.error.ts'
import { isModelSupported } from '../../simulation-computation/model-support/is-model-supported.ts'
import { createSimulationComputation } from '../../simulation-computation/repositories/simulation-computations.repository.ts'
import { findUserById } from '../../users/repositories/users.repository.ts'
import { mapComputedResultsToContactAttributes } from '../emails/map-computed-results-to-contact-attributes.ts'
import {
  createSendGroupCreatedEmail,
  createSendGroupJoinedEmail,
  createSendPollJoinedEmail,
} from '../emails/simulation-emails.ts'
import {
  type CompleteSimulationError,
  SimulationCompletedError,
  SimulationIncompleteError,
  SimulationInvalidModelError,
  SimulationNotFoundError,
  ZeroFootprintError,
} from '../errors/simulations.error.ts'
import { isSimulationCompleted } from '../helpers/simulation-guards.ts'
import { parseModelString, serializeModel } from '../repository/model.mapper.ts'
import {
  findSimulationById,
  updateSimulation,
} from '../repository/simulation.repository.ts'
import type { Simulation } from '../types/simulation.ts'
import type { ComputedResults } from '../validators/computed-results.schema.ts'

interface CompleteSimulationDependencies {
  logger: Logger
  captureException: CaptureException
  addOrUpdateContact: AddOrUpdateContact
  sendEmail: SendEmail
  /** Public origin the emails link back to */
  origin: string
  /** Runs the post-completion side effects outside of the request lifecycle */
  backgroundTaskRunner: BackgroundTaskRunner
}

export function createCompleteSimulation({
  logger,
  captureException,
  addOrUpdateContact,
  sendEmail,
  origin,
  backgroundTaskRunner,
}: CompleteSimulationDependencies) {
  const sendGroupCreatedEmail = createSendGroupCreatedEmail(sendEmail)
  const sendGroupJoinedEmail = createSendGroupJoinedEmail(sendEmail)
  const sendPollJoinedEmail = createSendPollJoinedEmail(sendEmail)

  return async function completeSimulation({
    userSession,
    simulationId,
    progression,
    model,
    situation,
    foldedSteps,
    computedResults,
    locale,
  }: {
    userSession: AppUser
    simulationId: string
    progression: number
    /** The model the client ran the test with; persisted with the completion. */
    model: string
    situation: Situation<DottedName>
    foldedSteps: DottedName[]
    computedResults: ComputedResults
    locale: ISOSupportedLanguage
  }): Promise<
    Result<Pick<Simulation, 'groups' | 'polls'>, CompleteSimulationError>
  > {
    const userId = userSession.id

    if (progression !== 1) return failure(new SimulationIncompleteError())
    if (computedResults.carbone.bilan === 0) {
      return failure(new ZeroFootprintError())
    }

    // The client's model is the one its answers were given against — never
    // substituted by the persisted one, which can be stale.
    const clientModel = parseModelString(model)
    if (!clientModel) return failure(new SimulationInvalidModelError(model))

    const simulation = await findSimulationById({ id: simulationId, userId })
    if (!simulation) return failure(new SimulationNotFoundError())
    if (isSimulationCompleted(simulation))
      return failure(new SimulationCompletedError())

    const isModelSupportedForComputation = isModelSupported(clientModel)

    if (!isModelSupportedForComputation) {
      const exception = new UnsupportedModelError(clientModel)
      logger.error(exception.message, { model: exception.model })
      captureException(exception)
    }

    const updated = await transaction(async (tx) => {
      const update = await updateSimulation(
        {
          id: simulationId,
          userId,
          situation,
          foldedSteps,
          progression,
          computedResults,
          model: serializeModel(clientModel),
        },
        tx
      )
      if (!update.success) return update

      if (isModelSupportedForComputation) {
        const computation = await createSimulationComputation(simulationId, tx)
        if (!computation.success) return computation
      }

      // The completed simulation changes the poll totals; every poll it belongs
      // to is queued for a full recomputation.
      for (const { id } of simulation.polls ?? []) {
        await enqueuePollStatsComputation(id, tx)
      }

      return success()
    })

    if (!updated.success) return updated

    backgroundTaskRunner(async () => {
      if (!userSession.isAuth) return
      const promises = await Promise.allSettled([
        addOrUpdateContact({
          email: userSession.email,
          attributes: {
            [Attributes.USER_ID]: userId,
            [Attributes.LAST_SIMULATION_DATE]: simulation.date.toISOString(),
            ...mapComputedResultsToContactAttributes(computedResults, locale),
          },
        }),
        (async () => {
          // The most recent membership is the one the user just completed.
          const lastPoll = simulation.polls?.at(-1)
          if (lastPoll) {
            const poll = await findPollById(lastPoll.id)
            invariant(poll)
            return sendPollJoinedEmail({
              organisation: poll.organisation,
              simulationId,
              locale,
              origin,
              email: userSession.email,
              poll,
            })
          }

          // Only try to find group if no poll was found (polls are more frequent than groups)
          const lastGroup = simulation.groups?.at(-1)
          if (lastGroup) {
            const [group, user] = await Promise.all([
              findGroupById(lastGroup.id),
              findUserById(userId),
            ])
            invariant(group && user && user.email) // safe as retrieve by reliable ids
            const params = {
              group,
              origin,
              user,
            }

            return group.administratorId === userId
              ? sendGroupCreatedEmail(params)
              : sendGroupJoinedEmail(params)
          }

          return success()
        })(),
      ])

      for (const [index, promise] of promises.entries()) {
        let error: unknown
        if (promise.status === 'rejected') error = promise.reason
        else if (!promise.value.success) error = promise.value.error
        if (error) {
          captureException(error)
          logger.error('Failed to run side effect', {
            index,
            error,
          })
        }
      }
    })

    return success({
      groups: simulation.groups,
      polls: simulation.polls,
    })
  }
}
