import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { RunInBackground } from '../../../lib/background-task.ts'
import type { Result } from '../../../lib/result.ts'
import { failure, success } from '../../../lib/result.ts'
import { transaction } from '../../../lib/transaction.ts'
import type { AppUser } from '../../auth/types/user-session.ts'
import { Attributes } from '../../emails/email.constant.ts'
import type { AddOrUpdateContact, SendEmail } from '../../emails/types.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import { findGroupsBySimulationId } from '../../groups/repositories/group.repository.ts'
import type { CaptureException, Logger } from '../../logger/index.ts'
import { findPollsBySimulationId } from '../../polls/repositories/poll.repository.ts'
import { UnsupportedModelError } from '../../simulation-computation/errors/simulation-computation.error.ts'
import { isModelSupported } from '../../simulation-computation/model-support/is-model-supported.ts'
import { createSimulationComputation } from '../../simulation-computation/repositories/simulation-computations.repository.ts'
import { findUserById } from '../../users/repositories/users.repository.ts'
import { mapSimulationToContactAttributes } from '../emails/map-simulation-to-contact-attributes.js'
import {
  createSendGroupCreatedEmail,
  createSendGroupJoinedEmail,
  createSendPollJoinedEmail,
} from '../emails/simulation-emails.ts'
import {
  type CompleteSimulationError,
  SimulationCompletedError,
  SimulationIncompleteError,
  SimulationNotFoundError,
  ZeroFootprintError,
} from '../errors/simulations.error.ts'
import { isSimulationCompleted } from '../helpers/simulation-guards.ts'
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
  runInBackground: RunInBackground
}

export function createCompleteSimulation({
  logger,
  captureException,
  addOrUpdateContact,
  sendEmail,
  origin,
  runInBackground,
}: CompleteSimulationDependencies) {
  const sendGroupCreatedEmail = createSendGroupCreatedEmail(sendEmail)
  const sendGroupJoinedEmail = createSendGroupJoinedEmail(sendEmail)
  const sendPollJoinedEmail = createSendPollJoinedEmail(sendEmail)

  return async function completeSimulation({
    userSession,
    simulationId,
    progression,
    situation,
    foldedSteps,
    computedResults,
    locale,
  }: {
    userSession: AppUser
    simulationId: string
    progression: number
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

    const simulation = await findSimulationById({ id: simulationId, userId })
    if (!simulation) return failure(new SimulationNotFoundError())
    if (isSimulationCompleted(simulation))
      return failure(new SimulationCompletedError())

    const isModelSupportedForComputation = isModelSupported(simulation.model)

    if (!isModelSupportedForComputation) {
      const exception = new UnsupportedModelError(simulation.model)
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
        },
        tx
      )
      if (!update.success) return update

      if (isModelSupportedForComputation) {
        const computation = await createSimulationComputation(simulationId, tx)
        if (!computation.success) return computation
      }

      // TODO: create poll stats computation

      return success()
    })

    if (!updated.success) return updated

    runInBackground(async () => {
      if (!userSession.isAuth || !userSession.email) return
      const promises = await Promise.allSettled([
        addOrUpdateContact({
          email: userSession.email,
          attributes: {
            [Attributes.USER_ID]: userId,
            [Attributes.LAST_SIMULATION_DATE]: simulation.date.toISOString(),
            ...mapSimulationToContactAttributes(
              {
                computedResults,
              },
              locale
            ),
          },
        }),
        (async () => {
          // The most recent membership is the one the user just completed.
          const polls = await findPollsBySimulationId({ simulationId })
          const poll = polls.at(-1)
          if (poll) {
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
          const [user, groups] = await Promise.all([
            findUserById(userId),
            findGroupsBySimulationId({ simulationId }),
          ])
          // should never happen since we check the user session before
          if (!user || !user.email) throw new Error('invariant')
          const group = groups.at(-1)
          if (group) {
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
