import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { BackgroundTaskRunner } from '../../../lib/background-task-runner.ts'
import { invariant } from '../../../lib/invariant.ts'
import type { Result } from '../../../lib/result.ts'
import { failure, success } from '../../../lib/result.ts'
import { toError } from '../../../lib/to-error.ts'
import { transaction } from '../../../lib/transaction.ts'
import type { AppUser } from '../../auth/types/user-session.ts'
import { Attributes } from '../../emails/email.constant.ts'
import type { EmailRequestError } from '../../emails/errors.ts'
import type { AddOrUpdateContact, SendEmail } from '../../emails/types.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import { findGroupById } from '../../groups/repositories/group.repository.ts'
import type { Logger } from '../../logger/index.ts'
import { findPollById } from '../../polls/repositories/poll.repository.ts'
import { enqueuePollStatsComputation } from '../../polls/stats/services/enqueue-poll-stats-computation.ts'
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
  addOrUpdateContact: AddOrUpdateContact
  sendEmail: SendEmail
  /** Public origin the emails link back to */
  origin: string
  /** Runs the post-completion side effects outside of the request lifecycle */
  backgroundTaskRunner: BackgroundTaskRunner
}

export function createCompleteSimulation({
  logger,
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
    const simulationLogger = logger.child({
      component: 'core.service.completeSimulation',
      simulationId,
    })
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
      // The computation is skipped: the simulation is still completed and stored.
      simulationLogger.warn('Unsupported model', {
        code: 'unsupported_model',
        model: simulation.model,
      })
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

      /**
       * A side effect failure does not undo the completion: it is reported
       * under the name of the call it comes from, and the next one still runs.
       */
      const runSideEffect = async (
        sideEffect: string,
        run: () => Promise<Result<void, EmailRequestError>>
      ) => {
        try {
          const result = await run()

          if (!result.success) {
            simulationLogger.error(result.error, { sideEffect })
          }
        } catch (error) {
          simulationLogger.error(toError(error), { sideEffect })
        }
      }

      await Promise.all([
        runSideEffect('addOrUpdateContact', () =>
          addOrUpdateContact({
            email: userSession.email,
            attributes: {
              [Attributes.USER_ID]: userId,
              [Attributes.LAST_SIMULATION_DATE]: simulation.date.toISOString(),
              ...mapComputedResultsToContactAttributes(computedResults, locale),
            },
          })
        ),
        runSideEffect('joinedEmail', async () => {
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
        }),
      ])
    })

    return success({
      groups: simulation.groups,
      polls: simulation.polls,
    })
  }
}
